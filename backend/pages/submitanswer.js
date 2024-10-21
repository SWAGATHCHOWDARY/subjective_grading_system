const express = require('express');
const router = express.Router();
const StudentAnswer = require('../model/stdanser');
const Test = require('../model/test');
const Question = require('../model/question');
const multer = require('multer');
const GridFSBucket = require('mongodb').GridFSBucket;
const mongoose = require('mongoose');

// Initialize GridFSBucket for file storage
let gfs;
mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
});

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Submit answers route
router.post('/', upload.array('answers'), async (req, res) => {
  try {
    const { testId, studentId } = req.body;
    const answers = JSON.parse(req.body.answers); // Assuming answers are sent as JSON

    if (!testId || !studentId || !req.files) {
      return res.status(400).json({ error: 'Missing testId, studentId, or answers' });
    }

    // Save student answers logic...

    res.status(201).json({ message: 'Answers submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit exam', details: error.message });
  }
});

module.exports = router;
