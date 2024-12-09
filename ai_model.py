from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from google.cloud import vision, language_v1
from google.cloud import aiplatform_v1 as aiplatform
import vertexai
from vertexai.generative_models import GenerativeModel, ChatSession
import PyPDF2
from sentence_transformers import SentenceTransformer
import numpy as np

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow Cross-Origin Resource Sharing for API access from other domains


class GradingSystem:
    def __init__(self, vision_credentials, nlp_credentials, aiplatform_credentials, project_id, location="us-central1"):
        """Initialize the GradingSystem with APIs and credentials."""
        self.vision_credentials = vision_credentials
        self.nlp_credentials = nlp_credentials
        self.aiplatform_credentials = aiplatform_credentials
        self.project_id = project_id
        self.location = location

        # Initialize Vision and NLP API Clients
        self.vision_client = vision.ImageAnnotatorClient.from_service_account_file(self.vision_credentials)
        self.nlp_client = language_v1.LanguageServiceClient.from_service_account_file(self.nlp_credentials)

        # Set environment variable for AI Platform (Vertex AI)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = self.aiplatform_credentials

        # Initialize Vertex AI (Generative Models)
        vertexai.init(project=self.project_id, location=self.location)
        self.chat_model = GenerativeModel("gemini-1.5-flash-002")

        # Initialize a SentenceTransformer for text embedding
        self.sentence_model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')

        # Set up API client options for aiplatform_v1
        self.api_endpoint = f"{self.location}-aiplatform.googleapis.com"
        self.client_options = {"api_endpoint": self.api_endpoint}
        self.model_client = aiplatform.services.model_service.ModelServiceClient(client_options=self.client_options)

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file."""
        try:
            with open(pdf_path, 'rb') as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)
                text = ''
                for page in reader.pages:
                    text += page.extract_text()
            return text
        except Exception as e:
            raise Exception(f"Error reading PDF: {e}")
        
    def perform_ocr(self, image_path: str) -> str:
        """Perform OCR using Vision API."""
        with open(image_path, "rb") as image_file:
            content = image_file.read()
        image = vision.Image(content=content)
        response = self.vision_client.text_detection(image=image)
        if response.error.message:
            raise Exception(f"Vision API Error: {response.error.message}")
        texts = response.text_annotations
        return texts[0].description if texts else ""
    
    def find_relevant_context(self, textbook: str, question: str, top_k: int = 3) -> str:
        """Retrieve the most relevant sections from the textbook for the given question."""
        try:
            sections = textbook.split('\n\n')  # Split textbook into sections
            question_embedding = self.sentence_model.encode(question)
            section_embeddings = self.sentence_model.encode(sections)

            # Compute cosine similarity
            similarities = np.dot(section_embeddings, question_embedding) / (
                np.linalg.norm(section_embeddings, axis=1) * np.linalg.norm(question_embedding)
            )

            # Get top_k most relevant sections
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            relevant_sections = [sections[i] for i in top_indices]
            return "\n\n".join(relevant_sections)
        except Exception as e:
            raise Exception(f"Error finding relevant context: {e}")

    def extract_keywords(self, text: str) -> set:
        """Extract keywords using NLP API."""
        document = language_v1.Document(content=text, type_=language_v1.Document.Type.PLAIN_TEXT)
        response = self.nlp_client.analyze_entities(document=document)
        return {entity.name.lower() for entity in response.entities}

    def generate_feedback_with_ai(self, student_answer: str, teacher_answer: str, score: float, context: str) -> str:
    #def generate_feedback_with_ai(self, student_answer: str, teacher_answer: str, score: float) -> str:

        """Generate concise feedback using Vertex AI."""
        chat_session = self.chat_model.start_chat()
        prompt = f"""
        You are an intelligent teaching assistant. Evaluate the following student's answer concisely.
        Context from the textbook:
        {context}

        Teacher's Answer: {teacher_answer}
        Student's Answer: {student_answer}
        Score: {score}

        Provide:
        1. Key strengths of the student's answer.
        2. Key weaknesses and areas for improvement.
        3. A brief, encouraging remark to motivate the student.

        Ensure the feedback is summary limited to 30 words.
        """
        text_response = []
        responses = chat_session.send_message(prompt, stream=True)
        for chunk in responses:
            text_response.append(chunk.text)
        return "".join(text_response)

    def evaluate_answer(self, data: dict) -> dict:
        """Main evaluation function with textbook reference."""
        try:
            pdf_path = data['textbook']
            question = data['question']
            student_answer = data['studentAnswer']
            teacher_answer = data['teacherAnswer']
            max_score = data['MaximumMarks']
            # Extract textbook content and find relevant context
            textbook_content = self.extract_text_from_pdf(pdf_path)
            context = self.find_relevant_context(textbook_content, question)

            # Extract keywords
            student_keywords = self.extract_keywords(student_answer)
            teacher_keywords = self.extract_keywords(teacher_answer)

            # Calculate relevance and completeness
            matching_keywords = student_keywords.intersection(teacher_keywords)
            relevance = len(matching_keywords) / len(teacher_keywords) if teacher_keywords else 0.0
            completeness = len(student_keywords) / len(teacher_keywords) if teacher_keywords else 0.0

            # Language quality (simplistic token count)
            language_quality = min(1.0, len(student_answer.split()) / 50)

            # Calculate final score
            score = (
                relevance * 0.4 + completeness * 0.4 + language_quality * 0.2
            ) * max_score


            # Generate feedback using Vertex AI Chat
            feedback = self.generate_feedback_with_ai(student_answer, teacher_answer, score, context)
            #feedback = self.generate_feedback_with_ai(student_answer, teacher_answer, score)

            return {
                "score": round(score, 2),
                "relevance": round(relevance * 100, 2),
                "completeness": round(completeness * 100, 2),
                "language_quality": round(language_quality * 100, 2),
                "feedback": feedback
            }
        except Exception as e:
            return {"score": 0.0, "feedback": {"error": f"Error during evaluation: {str(e)}"}}


# Initialize the GradingSystem
grading_system = GradingSystem(
    vision_credentials="ttt\\tata-class-edge-5f76-1104c5682b3e.json",
    nlp_credentials="ttt\\naturallanguage api\\tata-class-edge-5f76-bbf5b5c5c5d9.json",
    aiplatform_credentials="ttt\\aiplatform api\\tata-class-edge-5f76-d642d656d947.json",
    #vertex_ai_credentials = "ttt\tata-class-edge-5f76-1104c5682b3e.json"
    project_id="tata-class-edge-5f76",
    location="us-central1"
)


@app.route('/evaluate', methods=['POST'])
def evaluate():
    try:
        # Extract JSON payload from the request
        data = request.get_json()

        # Validate required fields
        required_fields = ['studentAnswer', 'teacherAnswer', 'question', 'referencePDF','maxmarks']
        #required_fields = ['studentAnswer', 'teacherAnswer', 'question']        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"'{field}' is required in the request"}), 400

        student_answer = data['studentAnswer']
        teacher_answer = data['teacherAnswer']
        question = data['question']
        reference_pdf = data['referencePDF']
        maximummarks = data['maxmarks']

        # Ensure reference PDF exists
        if not os.path.exists(reference_pdf):
            return jsonify({"error": "Reference PDF not found at the specified path"}), 404

        # Prepare data for evaluation
        evaluation_data = {
            "textbook": reference_pdf,
            "question": question,
            "studentAnswer": student_answer,
            "teacherAnswer": teacher_answer,
            "MaximumMarks":maximummarks,
        }

        # Call the GradingSystem's evaluation method
        result = grading_system.evaluate_answer(evaluation_data)
        print(result)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/perform-ocr', methods=['POST'])
def perform_ocr_endpoint():
    try:
        # Check if a file is provided in the request
        if 'image' not in request.files:
            return jsonify({"error": "Image file is required"}), 400

        image_file = request.files['image']

        # Save the image temporarily
        temp_image_path = f"/tmp/{image_file.filename}"
        image_file.save(temp_image_path)

        # Perform OCR using GradingSystem
        extracted_text = grading_system.perform_ocr(temp_image_path)

        # Delete the temporary file
        os.remove(temp_image_path)

        # Return the extracted text as a JSON response
        return jsonify({"extracted_text": extracted_text}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
