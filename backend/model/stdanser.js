const mongoose = require('mongoose');

const StudentAnswerSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
      studentAnswer: { type: String, required: true },  // Student's answer
      teacherAnswer: { type: String },  // Teacher's answer for reference
      score: { type: Number, default: '0' },  // Individual question score
      reasonForGrade: { type: String }  // Reason for score
    }
  ],
  totalScore: { type: Number, default: 0 },
  overallfeedback : {type : String},  
  submittedAt: { type: Date, default: Date.now }
});

const StudentAnswer = mongoose.model('StudentAnswer', StudentAnswerSchema, 'studentanswer');

module.exports = StudentAnswer;
