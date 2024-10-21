const express = require('express');
const router = express.Router();
const StudentAnswer = require('../model/stdanser');
const User = require('../model/user');
const Test = require('../model/test'); // Make sure to import the Test model

router.get('/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    console.log("I am in backend student grades");
    const student = await User.findOne({ idno: studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const student_Id = student._id;

    const grades = await StudentAnswer.find({ studentId: student_Id })
      .select('testId answers');

    const result = await Promise.all(grades.map(async (grade) => {
      const test = await Test.findOne({ _id: grade.testId });
      return {
        testId: test.testId,
        grade: grade.answers[0]?.grade || 'Not graded',
        reasonForGrade: grade.answers[0]?.reasonForGrade || 'No reason provided'
      };
    }));

    res.json({ grades: result });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

module.exports = router;