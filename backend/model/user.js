const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  Fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  hashedpassword: {
    type: String,
    required: true,
  },
  isteacher: {
    type: Boolean,
    required: true,
  },
  idno: {
    type: String,
    required: true,
  }
});

const User = mongoose.model('User', userSchema, 'students');

module.exports = User;