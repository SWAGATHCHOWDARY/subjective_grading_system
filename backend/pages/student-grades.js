const express = require('express');
const router = express.Router();
const StudentAnswer = require('../model/stdanser');
const User = require('../model/user');
const Test = require('../model/test');

router.get('/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    console.log("Fetching student grades...");

    // Fetch student details
    const student = await User.findOne({ idno: studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const student_Id = student._id;

    // Fetch grades and populate test details
    const grades = await StudentAnswer.find({ studentId: student_Id })
      .select('testId answers totalScore overallfeedback')
      .populate('testId', 'testId'); // Populate testId field with testId from Test schema

    // Construct result array
    const result = grades.map((grade) => {
      const testId = grade.testId?.testId || 'Unknown Test ID';
    
      return {
        testId,
        score: grade.totalScore || 'Not graded',
        feedbacks: grade.overallfeedback || 'No reason provided' 
      };
    });
    
    console.log(result);
    res.json({ grades: result });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

module.exports = router;
