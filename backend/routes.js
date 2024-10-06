const express = require('express');
const router = express.Router();

const signUpPage = require('./pages/signup');
const loginPage = require('./pages/login')

router.get('/', (req, res) => {
    res.send('Welcome to the home page!');
  });

//Page routess

router.use('/signup', signUpPage);
router.use('/login',loginPage)


module.exports = router;