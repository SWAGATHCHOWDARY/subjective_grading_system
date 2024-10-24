const express = require('express');
const router = express.Router();
const getexams = require('./pages/exam');
const signUpPage = require('./pages/signup');
const loginPage = require('./pages/login');
const uploadExam = require('./pages/upload-exam');
const studentgrades = require('./pages/student-grades')
const examRoutes = require('./pages/examroutes');  
const getResults = require('./pages/get-results');  // Handles fetching results
const updateGrades = require('./pages/update-grades')
const evaluate = require('./pages/evaluate')
// Home route
router.get('/', (req, res) => {
  res.send('Welcome to the home page!');
});

// Page routes
router.use('/evaluate',evaluate);
router.use('/signup', signUpPage); // Handles signup-related routes
router.use('/login', loginPage); // Handles login-related routes
router.use('/exam', examRoutes);  // Add this line
router.use('/view-results', getResults); // View exam results
router.use('/update-grades', updateGrades);
router.use('/student-grades',studentgrades)
router.use('/upload-exam', uploadExam); // Handles exam uploading routes
router.use('/', getexams); // Handles exam-related routes



module.exports = router;
