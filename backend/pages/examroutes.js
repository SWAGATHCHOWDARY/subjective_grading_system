const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Test = require('../model/test');
const Question = require('../model/question');
const StudentAnswer = require('../model/stdanser');
const multer = require('multer');
const GridFSBucket = require('mongodb').GridFSBucket;
const fs = require('fs');
const User = require('../model/user');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// GridFS setup
let gfs;
mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
});

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

// Route to submit exam answers
router.post('/submit-exam', upload.array('answers', 10), async (req, res) => {
    try {
      const { testId, studentId } = req.body;
  
      const test = await Test.findOne({ testId }).populate('questions');
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }
      const student = await User.findOne({ idno: studentId });
      if (!student) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      const answers = await Promise.all(test.questions.map(async (question, index) => {
        let fileId = null;
        if (req.files[index]) {
          const file = req.files[index];
          const uploadStream = gfs.openUploadStream(file.originalname);
          const readStream = require('fs').createReadStream(file.path);
  
          await new Promise((resolve, reject) => {
            readStream.pipe(uploadStream)
              .on('finish', () => {
                fileId = uploadStream.id;
                resolve();
              })
              .on('error', reject);
          });
  
          fs.unlinkSync(file.path); // Clean up temporary file
        }
  
        return {
          questionId: question._id,
          studentAnswer: {
            file: fileId
          },
          teacherAnswer: question.teacherAnswer || '',
          grade: 'Pending',
          reasonForGrade: 'Pending'
        };
      }));
  
      const studentAnswer = new StudentAnswer({
        testId: test._id,
        studentId:student._id,
        answers
      });
  
      await studentAnswer.save();
  
      res.status(201).json({ message: 'Exam submitted successfully' });
    } catch (error) {
      console.error('Error submitting exam:', error);
      res.status(500).json({ error: 'Failed to submit exam', details: error.message });
    }
  });

module.exports = router;
