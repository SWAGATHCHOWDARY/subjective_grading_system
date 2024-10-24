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
    type: String,  // Storing the teacher's answer as text
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the teacher who created the question
    required: true
  }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema, 'questions');
module.exports = Question;
