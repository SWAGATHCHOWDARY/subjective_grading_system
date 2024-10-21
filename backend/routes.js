const express = require('express');
const router = express.Router();
const getexams = require('./pages/exam');
const signUpPage = require('./pages/signup');
const loginPage = require('./pages/login');
const uploadExam = require('./pages/upload-exam');
const studentgrades = require('./pages/student-grades')
// Import exam-related backend routes from examroutes.js
const examRoutes = require('./pages/examroutes');  // Add this line

// Home route
router.get('/', (req, res) => {
  res.send('Welcome to the home page!');
});

// Page routes
router.use('/signup', signUpPage); // Handles signup-related routes
router.use('/login', loginPage); // Handles login-related routes
router.use('/upload-exam', uploadExam); // Handles exam uploading routes
router.use('/', getexams); // Handles exam-related routes

// Add the routes from examroutes.js
router.use('/exam', examRoutes);  // Add this line
router.use('/student-grades',studentgrades)
module.exports = router;
