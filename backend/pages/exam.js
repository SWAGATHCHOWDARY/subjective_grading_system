const express = require('express');
const router = express.Router();
const Test = require('../model/test'); 
const User = require('../model/user');

// Route to get exams associated with a teacher
router.get('/get-teacher-exams/:teacherId', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    console.log("in backend exams")
    const teacher = await User.findOne({ idno: teacherId });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Find all exams for the teacher
    const exams = await Test.find({ teacher: teacher._id });

    if (!exams || exams.length === 0) {
      return res.status(404).json({ error: 'No exams found for this teacher' });
    }

    res.status(200).json({ exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
