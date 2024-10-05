const express = require("express");
const mongoose = require('mongoose');
const routes = require('../routes');
const app = express();


mongoose.connect('mongodb+srv://saiswagath:oXuYHolYF6ErPegd@cluster1.utkxd.mongodb.net/project_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB Atlas successfully');
})
.catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
});

app.use('/', routes);

app.get('/',(req,res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});