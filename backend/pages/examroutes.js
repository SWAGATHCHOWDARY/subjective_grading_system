const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Test = require('../model/test');
const StudentAnswer = require('../model/stdanser');
const User = require('../model/user');

// Route to get exam questions
router.get('/get-exam-questions/:testId', async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findOne({ testId }).populate('questions');

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const questions = test.questions.map(q => ({
      id: q._id,
      questionText: q.questionText
    }));

    res.json({ questions });
  } catch (error) {
    console.error('Error fetching exam questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to submit exam answers (text-based answers)
router.post('/submit-exam', async (req, res) => {
  try {
    const { testId, studentId, answers } = req.body;  // Receiving answers as text

    if (!testId || !studentId || !answers) {
      return res.status(400).json({ error: 'Missing testId, studentId, or answers' });
    }

    const test = await Test.findOne({ testId }).populate('questions');
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const student = await User.findOne({ idno: studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Process each question and corresponding answer
    const studentAnswers = test.questions.map(question => {
      const answer = answers.find(a => a.questionId === String(question._id));
      if (!answer || typeof answer.studentAnswer !== 'string') {
        throw new Error(`Missing or invalid answer for question: ${question.questionText}`);
      }

      return {
        questionId: question._id,
        studentAnswer: answer.studentAnswer,  // Text-based student answer
        teacherAnswer: question.teacherAnswer || '',
        grade: 'Pending',
        reasonForGrade: 'Pending'
      };
    });

    // Create a new StudentAnswer document
    const newStudentAnswer = new StudentAnswer({
      testId: test._id,
      studentId: student._id,
      answers: studentAnswers,
      submittedAt: new Date()
    });

    // Save the student's answers
    await newStudentAnswer.save();

    res.status(201).json({ message: 'Exam submitted successfully' });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ error: 'Failed to submit exam', details: error.message });
  }
});

module.exports = router;
