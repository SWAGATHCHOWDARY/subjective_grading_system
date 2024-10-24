const express = require('express');
const router = express.Router();
const StudentAnswer = require('../model/stdanser');
const User = require('../model/user');
const Test = require('../model/test');

// Fetch the grades for all students who took a particular exam
router.get('/:examId', async (req, res) => {
  const { examId } = req.params;

  try {
    const test = await Test.findOne({_id: examId });
  console.log("Test in backend!")
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const studentAnswers = await StudentAnswer.find({ testId: test._id });

    const result = await Promise.all(studentAnswers.map(async (answer) => {
      const student = await User.findOne({ _id: answer.studentId });
      return {
        studentName: student.Fullname,
        grade: answer.answers[0]?.grade || 'Not graded',
        reasonForGrade: answer.answers[0]?.reasonForGrade || 'No reason provided'
      };
    }));

    res.json({ students: result });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

module.exports = router;
