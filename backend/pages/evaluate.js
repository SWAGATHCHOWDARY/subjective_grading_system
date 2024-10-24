const express = require('express');
const router = express.Router();
const StudentAnswer = require('../model/stdanser');
const Question = require('../model/question');
const Test = require('../model/test');
const sendToAIModel = require('./sendToAIModel');  // AI Model integration

// Evaluate all students for a specific test
router.post('/:examId', async (req, res) => {
  const { examId } = req.params;

  try {
    console.log("Trying to Evaluate!");
    // Fetch the test to get textbook and questions
    console.log(examId)
    const test = await Test.findOne({ _id: examId }).populate('questions');
    console.log(test)
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const textbook = test.textbook;  // Path or GridFS ID for the textbook file

    // Fetch all student answers for this test
    const studentAnswers = await StudentAnswer.find({ testId: test._id }).populate('answers.questionId');

    // Iterate over each student's answers and evaluate them using the AI model
    for (const studentAnswer of studentAnswers) {
      for (const answer of studentAnswer.answers) {
        const question = await Question.findById(answer.questionId);  // Fetch each question
        if (!question) {
          continue;  // Skip if question not found
        }

        // Prepare data for the AI model (student's answer, teacher's answer, question text, and textbook)
        const requestData = {
          studentAnswer: answer.studentAnswer,
          teacherAnswer: question.teacherAnswer,
          question: question.questionText,
          referencePDF: textbook,  // Assuming this is a path or ID to the textbook
        };

        // Call AI model for evaluation (using sendToAIModel)
        console.log("Calling Model!");
        const aiResponse = await sendToAIModel(requestData);

        // Update student's answer with the grade and reason
        answer.grade = aiResponse.grade;
        answer.reasonForGrade = aiResponse.reason;

        await studentAnswer.save();  // Save the updated student answer
      }
    }

    res.json({ message: 'Evaluation completed for all students' });
  } catch (error) {
    console.error('Error evaluating submissions:', error);
    res.status(500).json({ error: 'Failed to evaluate submissions' });
  }
});

module.exports = router;
