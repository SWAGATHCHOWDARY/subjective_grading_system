const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const User = require('../model/user');
const Test = require('../model/test');
const Question = require('../model/question');
const GridFSBucket = require('mongodb').GridFSBucket;

// Ensure the uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });  // Create the uploads folder if it doesn't exist
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);  // Save files in the uploads folder
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

// Route to handle exam and question uploads
router.post('/', upload.single('textbook'), async (req, res) => {
  try {
    const { examCode, teacherId } = req.body;
    const teacher = await User.findOne({ idno: teacherId });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Save the textbook file in GridFS
    let textbookFileId = null;
    if (req.file) {
      const uploadStream = gfs.openUploadStream(req.file.originalname);
      const readStream = fs.createReadStream(req.file.path);
      
      // Pipe the file into GridFS
      readStream.pipe(uploadStream);
      
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
          textbookFileId = uploadStream.id;  // Save the ObjectId of the file
          resolve();
        });
        uploadStream.on('error', reject);
      });
    }

    // Create a new Test document with the ObjectId reference to the textbook file
    const newTest = new Test({
      testId: examCode,
      teacher: teacher._id,
      textbook: textbookFileId,  // Store the ObjectId for GridFS file
      questions: []
    });

    await newTest.save();

    // Parse and save questions
    const questions = JSON.parse(req.body.questions);
    for (const questionData of questions) {
      const newQuestion = new Question({
        testId: newTest._id,
        questionText: questionData.questionText,
        teacher: teacher._id,
        teacherAnswer: questionData.teacherAnswer
      });

      await newQuestion.save();
      newTest.questions.push(newQuestion._id);
    }

    await newTest.save();
    res.status(201).json({ message: 'Exam and questions uploaded successfully' });

  } catch (error) {
    console.error('Error in file upload:', error);
    res.status(500).json({ error: 'Failed to upload exam', details: error.message });
  }
});

module.exports = router;
