const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  Fullname: {
    type: String,
    required: true,
    unique: true,
  },
  creds:{
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  },
  isteacher : {
    type: Boolean,
    required : true,
    
  },
  idno :{
    type: String,
    required : true,
  }
});

const User = mongoose.model('User', userSchema, 'student');

module.exports = User;