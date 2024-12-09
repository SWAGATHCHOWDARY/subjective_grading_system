const express = require('express');
const router = express.Router();
const StudentAnswer = require('../model/stdanser'); // Model for storing student answers
const Test = require('../model/test'); // Model for tests

// Route to fetch student answers for a specific test
router.get('/:examId/:studentId', async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    console.log('ExamId:', examId);
    console.log('StudentId:', studentId);

    // Find the answers for the specified test and student
    const studentAnswers = await StudentAnswer.findOne({
      testId: examId,
      studentId: studentId,
    }).populate({
      path: 'answers.questionId',
      select: 'questionText teacherAnswer',
    });

    if (!studentAnswers) {
      return res.status(404).json({ message: 'No answers found for this student.' });
    }

    res.status(200).json({
      answers: studentAnswers.answers,
      overallfeedback: studentAnswers.overallfeedback || '', // Include overall feedback
    });
  } catch (error) {
    console.error('Error fetching student answers:', error);
    res.status(500).json({ message: 'Error fetching student answers', error });
  }
});

// Route to update student answers for a specific test
router.put('/:examId/:studentId', async (req, res) => {
  const { examId, studentId } = req.params;
  const { answers, totalScore, overallfeedback } = req.body;

  try {
    const studentAnswer = await StudentAnswer.findOne({
      testId: examId,
      studentId: studentId,
    });

    if (!studentAnswer) {
      return res.status(404).json({ message: 'Student answers not found.' });
    }

    console.log('Before Update:', studentAnswer);
    console.log('Update Payload:', req.body);

    studentAnswer.answers = answers;
    studentAnswer.totalScore = totalScore;
    studentAnswer.overallfeedback = overallfeedback;

    await studentAnswer.save();

    console.log('After Update:', studentAnswer);
    res.status(200).json({ message: 'Answers and feedback updated successfully.' });
  } catch (error) {
    console.error('Error updating student answers:', error);
    res.status(500).json({ message: 'Error updating student answers and feedback.', error });
  }
});

module.exports = router;
