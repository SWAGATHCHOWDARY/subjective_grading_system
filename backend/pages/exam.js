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
// Assuming you already have routes for fetching exams
router.get('/get-exam-results/:examId', async (req, res) => {
  try {
    const { examId } = req.params;

    const studentAnswers = await StudentAnswer.find({ testId: examId }).populate('studentId', 'fullname'); // Assuming you want to fetch student details
    if (!studentAnswers) {
      return res.status(404).json({ error: 'No submissions found for this exam' });
    }

    const results = studentAnswers.map(answer => ({
      studentId: answer.studentId._id,
      studentName: answer.studentId.fullname,
      answers: answer.answers.map(ans => ({
        questionId: ans.questionId,
        grade: ans.grade,
        reasonForGrade: ans.reasonForGrade,
      })),
    }));

    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exam results' });
  }
});
router.post('/update-grades', async (req, res) => {
  try {
    const { examId, studentGrades } = req.body;

    for (const studentGrade of studentGrades) {
      await StudentAnswer.updateOne(
        { testId: examId, studentId: studentGrade.studentId },
        {
          $set: {
            'answers.$[elem].grade': studentGrade.grade,
            'answers.$[elem].reasonForGrade': studentGrade.reasonForGrade,
          },
        },
        {
          arrayFilters: [{ 'elem.questionId': studentGrade.questionId }],
        }
      );
    }

    res.status(200).json({ message: 'Grades updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update grades' });
  }
});

module.exports = router;
