from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import requests
import numpy as np
from typing import Dict, Tuple
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

class GradingSystem:
    def __init__(self):
        # Initialize the BERT model for similarity scoring
        self.sentence_model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        
        # Hugging Face API configuration
        self.api_url = "https://api-inference.huggingface.co/models/google/flan-t5-large"
        self.headers = {"Authorization": f"Bearer "}
        
        self.grade_thresholds = {
            'A': 0.85,
            'B': 0.70,
            'C': 0.55,
            'D': 0.40,
            'F': 0.0
        }

    def calculate_similarity(self, student_answer: str, reference_text: str) -> float:
        """Calculate semantic similarity using BERT embeddings"""
        try:
            # Generate embeddings
            student_embedding = self.sentence_model.encode(student_answer)
            reference_embedding = self.sentence_model.encode(reference_text)
            
            # Calculate cosine similarity
            similarity = np.dot(student_embedding, reference_embedding) / \
                        (np.linalg.norm(student_embedding) * np.linalg.norm(reference_embedding))
            
            return float(similarity)
        except Exception as e:
            print(f"Error in similarity calculation: {e}")
            return 0.0

    def get_model_evaluation(self, question: str, student_answer: str, 
                           teacher_answer: str, similarity_score: float) -> Tuple[str, str]:
        """Get evaluation using Hugging Face's API"""
        try:
            prompt = f"""Task: Grade this student answer.
            Question: {question}
            Student Answer: {student_answer}
            Reference Answer: {teacher_answer}
            Similarity Score: {similarity_score:.2f}

            Provide a letter grade (A/B/C/D/F) and a brief reason.
            Format: GRADE: (letter) REASON: (1-2 sentences)
            """

            # Make API call to Hugging Face
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json={"inputs": prompt, "parameters": {"max_length": 100}}
            )
            
            if response.status_code != 200:
                raise Exception(f"API call failed with status code: {response.status_code}")

            # Parse response
            response_text = response.json()[0]['generated_text']
            try:
                grade = response_text.split('GRADE:')[1].split('REASON:')[0].strip()
                reason = response_text.split('REASON:')[1].strip()
            except:
                # Fallback grading based on similarity score
                grade = self.get_grade_from_similarity(similarity_score)
                reason = "Grade based on similarity score due to evaluation parsing error."
            
            return grade, reason
            
        except Exception as e:
            print(f"Error in model evaluation: {e}")
            grade = self.get_grade_from_similarity(similarity_score)
            return grade, f"Grade based on similarity score. Technical error: {str(e)}"

    def get_grade_from_similarity(self, score: float) -> str:
        """Convert similarity score to letter grade"""
        for grade, threshold in self.grade_thresholds.items():
            if score >= threshold:
                return grade
        return 'F'

    def evaluate_answer(self, data: Dict) -> Dict:
        """Main evaluation function"""
        try:
            # Extract data
            student_answer = data['studentAnswer']
            teacher_answer = data['teacherAnswer']
            question = data['question']
            
            # Calculate similarity
            similarity_score = self.calculate_similarity(student_answer, teacher_answer)
            
            # Get model evaluation
            grade, reason = self.get_model_evaluation(
                question, student_answer, teacher_answer, similarity_score
            )
            
            # Calculate additional metrics
            response = {
                'grade': grade,
                'reason': reason
            }
            
            return response
            
        except Exception as e:
            print(f"Error in evaluation: {e}")
            return {
                'grade': 'F',
                'reason': f'Error occurred during evaluation: {str(e)}'
            }

    def _calculate_keyword_match(self, student_answer: str, teacher_answer: str) -> float:
        """Calculate the ratio of matching keywords"""
        student_words = set(student_answer.lower().split())
        teacher_words = set(teacher_answer.lower().split())
        matching_words = student_words.intersection(teacher_words)
        return len(matching_words) / len(teacher_words)

# Initialize grading system
grader = GradingSystem()

@app.route('/evaluate', methods=['POST'])
def evaluate():
    try:
        data = request.json
        if not all(key in data for key in ['studentAnswer', 'teacherAnswer', 'question']):
            return jsonify({
                'error': 'Missing required fields'
            }), 400
            
        result = grader.evaluate_answer(data)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
