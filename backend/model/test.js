
const mongoose = require('mongoose');

// Test schema
const testSchema = new mongoose.Schema({
  testId: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // ObjectId for teacher reference
  textbook: { type: String },  // Path to textbook file
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
}, { timestamps: true });

const Test = mongoose.model('Test', testSchema,'test');

module.exports = Test;
