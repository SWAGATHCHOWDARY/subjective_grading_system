const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  testId: {
    type: String, // Links to the examCode in the Test schema
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  teacherAnswer: {
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' } // Reference to GridFS for answer file
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the teacher who created the question
    required: true
  }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema,'questions');
module.exports = Question;
