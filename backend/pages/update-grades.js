const express = require('express');
const router = express.Router();
const StudentAnswer = require('../model/stdanser');
const User = require('../model/user');
// Update grades and reasons for a test
router.put('/:examId', async (req, res) => {
  const { examId } = req.params;
  const { students } = req.body;
    console.log(examId);
  try {
    for (const student of students) {
    console.log(student);
    const user = await User.findOne({Fullname : student.studentName});
    console.log(user)
      const studentAnswer = await StudentAnswer.findOne({
        studentId: user._id,
        testId: examId,
      });
      console.log(studentAnswer);
      if (studentAnswer) {
        studentAnswer.answers[0].grade = student.grade;
        studentAnswer.answers[0].reasonForGrade = student.reasonForGrade;
        await studentAnswer.save();
      }
    }

    res.json({ message: 'Grades updated successfully!' });
  } catch (error) {
    console.error('Error updating grades:', error);
    res.status(500).json({ error: 'Failed to update grades' });
  }
});

module.exports = router;
