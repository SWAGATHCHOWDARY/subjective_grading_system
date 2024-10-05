const express = require('express');
const router = express.Router();

const signUpPage = require('./pages/signup');


router.get('/', (req, res) => {
    res.send('Welcome to the home page!');
  });

//Page routess

router.use('/signup', signUpPage);


module.exports = router;