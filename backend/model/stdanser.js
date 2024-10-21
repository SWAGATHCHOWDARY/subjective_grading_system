const mongoose = require('mongoose');

const StudentAnswerSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
      studentAnswer: {
        file: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' } // GridFS file ID
      },
      teacherAnswer: { type: String }, // Store teacher's answer as a string (text feedback)
      grade: { type: String }, // Placeholder for grade
      reasonForGrade: { type: String } // Placeholder for reason for grade
    }
  ],
  submittedAt: { type: Date, default: Date.now }
});

const StudentAnswer = mongoose.model('StudentAnswer', StudentAnswerSchema,'studentanswer');

module.exports = StudentAnswer;
