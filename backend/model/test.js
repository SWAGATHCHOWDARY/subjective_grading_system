const mongoose = require('mongoose');

// Test schema
const testSchema = new mongoose.Schema({
  testId: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // ObjectId for teacher reference
  textbook: { type: String },  // Path to textbook file (GridFS file ID)
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],  // Array of question references
}, { timestamps: true });

const Test = mongoose.model('Test', testSchema, 'test');

module.exports = Test;
