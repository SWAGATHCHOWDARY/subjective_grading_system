const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const User = require('../model/user');  
const Test = require('../model/test'); 
const Question = require('../model/question'); 
const GridFSBucket = require('mongodb').GridFSBucket;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);  
  }
});

const upload = multer({ storage: storage });

let gfs;
mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
});

router.post('/', upload.fields([
    { name: 'textbook', maxCount: 1 },  
    { name: 'questions[0][answerFile]', maxCount: 1 },  
    { name: 'questions[1][answerFile]', maxCount: 1 }, 
    { name: 'questions[2][answerFile]', maxCount: 1 }, 
  ]), async (req, res) => {
    try {
      console.log("Request body:", req.body);  
      console.log("Uploaded files:", req.files); 
  
      const { examCode, teacherId } = req.body;
      if (!examCode || !teacherId) {
        return res.status(400).json({ error: "Missing examCode or teacherId" });
      }
  
      const teacher = await User.findOne({ idno: teacherId });
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
  
      let textbookFile = null;
      if (req.files['textbook']) {
        textbookFile = req.files['textbook'][0].path;
      }
  
      const newTest = new Test({
        testId: examCode,
        teacher: teacher._id, 
        textbook: textbookFile,
        questions: []  
      });
  
      await newTest.save();
      console.log("New test created:", newTest);
  
      let questions;
      try {
        questions = JSON.parse(req.body.questions);
        console.log("Parsed questions:", questions);
      } catch (parseError) {
        console.error("Error parsing questions:", parseError);
        return res.status(400).json({ error: "Invalid questions data" });
      }
  
      if (!Array.isArray(questions)) {
        return res.status(400).json({ error: "Questions must be an array" });
      }
  
      for (let i = 0; i < questions.length; i++) {
        const questionData = questions[i];
        
        console.log(`Processing question ${i}:`, questionData);
  
        if (!questionData || typeof questionData !== 'object' || !questionData.questionText) {
          console.error(`Invalid question data for question ${i}:`, questionData);
          throw new Error(`Invalid question data for question ${i + 1}`);
        }
  
        let teacherAnswerFileId = null;
  
        if (req.files[`questions[${i}][answerFile]`]) {
          const answerFile = req.files[`questions[${i}][answerFile]`][0];
  
          const uploadStream = gfs.openUploadStream(answerFile.originalname);
          const readStream = require('fs').createReadStream(answerFile.path);
          readStream.pipe(uploadStream);
  
          await new Promise((resolve, reject) => {
            uploadStream.on('finish', () => {
              teacherAnswerFileId = uploadStream.id;
              resolve();
            });
            uploadStream.on('error', reject);
          });
        }
  
        const newQuestion = new Question({
          testId: newTest._id,  
          questionText: questionData.questionText,
          teacher: teacher._id, 
          teacherAnswer: {
            file: teacherAnswerFileId  
          }
        });
  
        console.log("New question before save:", newQuestion);
  
        await newQuestion.save();
        newTest.questions.push(newQuestion._id);
      }
  
      await newTest.save(); 
  
      res.status(201).json({ message: 'Exam and questions uploaded successfully' });
    } catch (error) {
      console.error('Error in file upload:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation failed', details: error.message });
      }
      res.status(500).json({ error: 'Failed to upload exam', details: error.message });
    }
  });
  
  module.exports = router;