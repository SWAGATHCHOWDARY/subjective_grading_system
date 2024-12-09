const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const fsPromises = require('fs/promises'); // For promise-based file handling
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

// Configure Multer for file uploads
const upload = multer({
  dest: 'uploads/', // Destination folder for uploaded files
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// Controller logic for handling OCR
const performOCR = async (req, res) => {
  const imagePath = req.file.path;
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath)); // Correctly use fs.createReadStream

    const response = await axios.post('http://localhost:5000/perform-ocr', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    console.log("Printing Response from AI:",response)
    res.status(200).json({ extracted_text: response.data.extracted_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process the image' });
  } finally {
    // Cleanup uploaded file
    await fsPromises.unlink(imagePath).catch((cleanupError) => {
      console.error('Error cleaning up file:', cleanupError);
    });
  }
};

// Define the route for OCR image uploads
router.post('/', upload.single('image'), performOCR);

module.exports = router;
