const express = require('express');
const router = express.Router();
const User = require('../model/user')
const StudentAnswer = require('../model/stdanser'); // StudentAnswer model
const Test = require('../model/test'); // Test model

// Route to fetch test details
router.get('/:testId/:studentId', async (req, res) => {
  const { testId, studentId } = req.params;
console.log("TestId:",testId);
console.log("StudentID:",studentId);
const testID = await Test.findOne({testId:testId});
console.log(testID);
const StudentID = await User.findOne({idno:studentId});
console.log(StudentID)
console.log("Entered the test details!")
  try {
    // Fetch the test and associated student answers
    const studentAnswers = await StudentAnswer.findOne({
      testId: testID._id,
      studentId: StudentID._id,
    }).populate({
      path: 'answers.questionId',
      select: 'questionText teacherAnswer',
    });

    if (!studentAnswers) {
      return res.status(404).json({ message: 'No test details found for this student.' });
    }

    // Format response to include required details
    const formattedAnswers = studentAnswers.answers.map((answer) => ({
      questionText: answer.questionId.questionText || 'N/A',
      studentAnswer: answer.studentAnswer || 'Not answered',
      teacherAnswer: answer.questionId.teacherAnswer || 'N/A',
      score: answer.score || 0,
      reasonForGrade: answer.reasonForGrade || 'No reason provided',
    }));

    // Respond with formatted data
    res.status(200).json({
      testId,
      studentId,
      answers: formattedAnswers,
      overallFeedback: studentAnswers.overallfeedback || 'No feedback provided',
    });
  } catch (error) {
    console.error('Error fetching test details:', error);
    res.status(500).json({ message: 'Error fetching test details', error });
  }
});

module.exports = router;
