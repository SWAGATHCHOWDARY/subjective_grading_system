const express = require('express');
const router = express.Router();
const User = require('../model/user');
const bcrypt = require('bcryptjs');

const SECRET_CODE = "95430";
 
router.post('/', async (req, res) => {
  try {
    console.log("Processing registration request");
    const { Fullname, email, password, isteacher, idno, secretcode } = req.body;

    if (!Fullname || !email || !password || !idno) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    console.log(email)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let isTeacher = false;
    if (isteacher === true){
        if (secretcode!==SECRET_CODE){
            return res.status(400).json({message:'Invalid teacher code!'});
        }
        isTeacher = true;
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      Fullname,
      email,
      hashedpassword: hashedPassword,
      isteacher:isTeacher, 
      idno
    });


    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during user registration:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error. Email or ID might already exist.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;