const express = require('express');
const User = require('../model/user');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.hashedpassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Include full name in the JWT payload
    const payload = { email: user.email, fullname: user.Fullname, isTeacher: user.isteacher };
    const token = generateToken(payload);

    const userType = user.isteacher ? 'teacher' : 'student';
    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      userType, 
      fullname: user.Fullname,
      userid:user.idno // Send full name in response
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
