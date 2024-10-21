const express = require('express');
const mongoose = require('mongoose');
const routes = require('../routes'); // Import routes from the routes folder
const cors = require('cors');

const app = express();

// MongoDB connection
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

// Middleware
app.use(cors()); // Handle cross-origin requests
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Use routes
app.use('/', routes);

// Default route for testing
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
