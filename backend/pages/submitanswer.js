// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const Test = require('../model/test');
// const Question = require('../model/question');
// const StudentAnswer = require('../model/stdanser');
// const User = require('../model/user');

// // Route to get exam questions
// router.get('/get-exam-questions/:testId', async (req, res) => {
//   try {
//     const { testId } = req.params;

//     const test = await Test.findOne({ testId }).populate('questions');

//     if (!test) {
//       return res.status(404).json({ error: 'Test not found' });
//     }

//     const questions = test.questions.map(q => ({
//       id: q._id,
//       questionText: q.questionText
//     }));

//     res.json({ questions });
//   } catch (error) {
//     console.error('Error fetching exam questions:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Route to submit exam answers
// router.post('/submit-exam', async (req, res) => {
//   try {
//     const { testId, studentId, answers } = req.body;

//     if (!testId || !studentId || !answers) {
//       return res.status(400).json({ error: 'Missing testId, studentId, or answers' });
//     }

//     // Find the test and populate the questions
//     const test = await Test.findOne({ testId }).populate('questions');
//     if (!test) {
//       return res.status(404).json({ error: 'Test not found' });
//     }

//     // Find the student
//     const student = await User.findOne({ idno: studentId });
//     if (!student) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     // Process each question and find the corresponding answer
//     const studentAnswers = test.questions.map(question => {
//       const answer = answers.find(a => a.questionId === String(question._id));
//       if (!answer || typeof answer.studentAnswer !== 'string') {
//         throw new Error(`Missing or invalid answer for question: ${question.questionText}`);
//       }

//       return {
//         questionId: question._id,
//         studentAnswer: answer.studentAnswer,  // Ensure it's a text-based student answer
//         teacherAnswer: question.teacherAnswer || '',
//         score: '0',
//         reasonForGrade: 'Pending'
//       };
//     });

//     // Create a new StudentAnswer document
//     const newStudentAnswer = new StudentAnswer({
//       testId: test._id,
//       studentId: student._id,
//       answers: studentAnswers,
//       submittedAt: new Date()
//     });

//     // Save the student's answers
//     await newStudentAnswer.save();

//     res.status(201).json({ message: 'Exam submitted successfully' });
//   } catch (error) {
//     console.error('Error submitting exam:', error);
//     res.status(500).json({ error: 'Failed to submit exam', details: error.message });
//   }
// });

// module.exports = router;

//version -2

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Test = require('../model/test');
const Question = require('../model/question');
const StudentAnswer = require('../model/stdanser');
const User = require('../model/user');
const { VisionClient } = require('@google-cloud/vision'); // Ensure @google-cloud/vision is installed

const visionClient = new VisionClient();

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Route to submit exam answers with file support
router.post('/submit-exam', upload.single('file'), async (req, res) => {
  try {
    const { testId, studentId, answers } = req.body;
    const file = req.file;

    if (!testId || !studentId || !answers) {
      return res.status(400).json({ error: 'Missing testId, studentId, or answers' });
    }

    // Find the test and populate the questions
    const test = await Test.findOne({ testId }).populate('questions');
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Find the student
    const student = await User.findOne({ idno: studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let extractedText = '';

    // If a file is attached, process it
    if (file) {
      const filePath = path.resolve(file.path);

      // Check if the file is an image
      if (file.mimetype.startsWith('image/')) {
        // Perform OCR on the image
        const [result] = await visionClient.textDetection(filePath);
        extractedText = result.fullTextAnnotation ? result.fullTextAnnotation.text : '';

        console.log('Extracted Text:', extractedText);

        // Cleanup the uploaded file
        fs.unlinkSync(filePath);
      } else {
        // If file is not an image, reject it
        return res.status(400).json({ error: 'Only image files are supported for file uploads' });
      }
    }

    // Process each question and find the corresponding answer
    const studentAnswers = test.questions.map(question => {
      const answer = answers.find(a => a.questionId === String(question._id));
      if (!answer || typeof answer.studentAnswer !== 'string') {
        throw new Error(`Missing or invalid answer for question: ${question.questionText}`);
      }

      return {
        questionId: question._id,
        studentAnswer: extractedText || answer.studentAnswer, // Use OCR text if available
        teacherAnswer: question.teacherAnswer || '',
        score: '0',
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

    res.status(201).json({ message: 'Exam submitted successfully', extractedText });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ error: 'Failed to submit exam', details: error.message });
  }
});

module.exports = router;
