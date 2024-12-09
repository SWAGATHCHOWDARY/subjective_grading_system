const express = require('express');
const router = express.Router();

const getexams = require('./pages/exam');
const signUpPage = require('./pages/signup');
const loginPage = require('./pages/login');
const uploadExam = require('./pages/upload-exam');
const studentgrades = require('./pages/student-grades');
const examRoutes = require('./pages/examroutes');
const getResults = require('./pages/get-results');
const updateGrades = require('./pages/update-grades');
const evaluate = require('./pages/evaluate');
const studentAnswers = require('./pages/individual-answers'); // Import student answers route
const testDetails = require('./pages/testdetails'); // Import test-details route

// Home route
router.get('/', (req, res) => {
  res.send('Welcome to the home page!');
});

// Page routes
router.use('/evaluate', evaluate);
router.use('/signup', signUpPage);
router.use('/login', loginPage);
router.use('/exam', examRoutes);
router.use('/view-results', getResults);
router.use('/update-grades', updateGrades);
router.use('/student-grades', studentgrades);
router.use('/upload-exam', uploadExam);
router.use('/student-answers', studentAnswers); // Register the student answers route
router.use('/test-details', testDetails); // Register the test-details route
router.use('/', getexams);

module.exports = router;
