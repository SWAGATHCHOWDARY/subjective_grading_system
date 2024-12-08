const express = require('express');
const router = express.Router();
const StudentAnswer = require('../model/stdanser');
const Question = require('../model/question');
const Test = require('../model/test');
const sendToAIModel = require('./sendToAIModel');  // AI Model integration

// Evaluate all students for a specific test
router.post('/:examId', async (req, res) => {
  const { examId } = req.params;
  const { relevance, completeness, language_quality } = req.body; // Criteria from frontend

  try {
    console.log("Evaluation process started!");
    console.log("Exam ID:", examId);
    console.log("Received criteria:", { relevance, completeness, language_quality });

    // Fetch the test to get textbook and questions
    const test = await Test.findOne({ _id: examId }).populate('questions');
    if (!test) {
      console.log("Test not found for Exam ID:", examId);
      return res.status(404).json({ error: 'Test not found' });
    }

    console.log("Fetched Test:", test);

    const textbook = test.textbook;  // Path or GridFS ID for the textbook file

    // Fetch all student answers for this test
    const studentAnswers = await StudentAnswer.find({ testId: test._id }).populate('answers.questionId');
    console.log("Fetched Student Answers:", studentAnswers);

    // Iterate over each student's answers and evaluate them using the AI model
    for (const studentAnswer of studentAnswers) {
      console.log("Evaluating for Student:", studentAnswer.studentId);

      for (const answer of studentAnswer.answers) {
        const question = await Question.findById(answer.questionId);  // Fetch each question
        if (!question) {
          console.log("Question not found for Answer:", answer);
          continue;  // Skip if question not found
        }

        console.log("Evaluating Answer:", {
          questionText: question.questionText,
          studentAnswer: answer.studentAnswer,
          teacherAnswer: question.teacherAnswer,
        });

        // Prepare data for the AI model (student's answer, teacher's answer, question text, and textbook)
        const requestData = {
          studentAnswer: answer.studentAnswer,
          teacherAnswer: question.teacherAnswer,
          question: question.questionText,
          referencePDF: textbook,  // Assuming this is a path or ID to the textbook
          criteria: { relevance, completeness, language_quality }, // Include criteria
        };

        console.log("Sending data to AI model:", requestData);

        // Call AI model for evaluation (using sendToAIModel)
        const aiResponse = await sendToAIModel(requestData);
        console.log("AI Model Response:", aiResponse);

        // Update student's answer with the grade and reason
        answer.grade = aiResponse.grade;
        answer.reasonForGrade = aiResponse.reason;

        await studentAnswer.save();  // Save the updated student answer
        console.log("Updated Student Answer:", answer);
      }
    }

    console.log("Evaluation completed for all students.");
    res.json({ message: 'Evaluation completed for all students' });
  } catch (error) {
    console.error('Error evaluating submissions:', error);
    res.status(500).json({ error: 'Failed to evaluate submissions' });
  }
});

module.exports = router;
