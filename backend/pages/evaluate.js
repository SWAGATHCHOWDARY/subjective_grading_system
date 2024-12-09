// const express = require('express');
// const router = express.Router();
// const StudentAnswer = require('../model/stdanser');
// const Question = require('../model/question');
// const Test = require('../model/test');
// const sendToAIModel = require('./sendToAIModel');  // AI Model integration

// // Evaluate all students for a specific test
// router.post('/:examId', async (req, res) => {
//   const { examId } = req.params;
//   const { relevance, completeness, language_quality } = req.body; // Criteria from frontend

//   try {
//     console.log("Evaluation process started!");
//     console.log("Exam ID:", examId);
//     console.log("Received criteria:", { relevance, completeness, language_quality });

//     // Fetch the test to get textbook and questions
//     const test = await Test.findOne({ _id: examId }).populate('questions');
//     if (!test) {
//       console.log("Test not found for Exam ID:", examId);
//       return res.status(404).json({ error: 'Test not found' });
//     }

//     console.log("Fetched Test:", test);

//     const textbook = test.textbook;  // Path or GridFS ID for the textbook file

//     // Fetch all student answers for this test
//     const studentAnswers = await StudentAnswer.find({ testId: test._id }).populate('answers.questionId');
//     console.log("Fetched Student Answers:", studentAnswers);

//     // Iterate over each student's answers and evaluate them using the AI model
//     for (const studentAnswer of studentAnswers) {
//       console.log("Evaluating for Student:", studentAnswer.studentId);

//       for (const answer of studentAnswer.answers) {
//         const question = await Question.findById(answer.questionId);  // Fetch each question
//         if (!question) {
//           console.log("Question not found for Answer:", answer);
//           continue;  // Skip if question not found
//         }

//         console.log("Evaluating Answer:", {
//           questionText: question.questionText,
//           studentAnswer: answer.studentAnswer,
//           teacherAnswer: question.teacherAnswer,
//         });

//         // Prepare data for the AI model (student's answer, teacher's answer, question text, and textbook)
//         const requestData = {
//           studentAnswer: answer.studentAnswer,
//           teacherAnswer: question.teacherAnswer,
//           question: question.questionText,
//           referencePDF: 'backend\\uploads\\1729665221880-textbook.pdf',  // Assuming this is a path or ID to the textbook
//           criteria: { relevance, completeness, language_quality }, // Include criteria
//         };

//         console.log("Sending data to AI model:", requestData);

//         // Call AI model for evaluation (using sendToAIModel)
//         const aiResponse = await sendToAIModel(requestData);
//         console.log("AI Model Response:", aiResponse);

//         // Update student's answer with the grade and reason
//         answer.score = aiResponse.score;
//         answer.reasonForGrade = aiResponse.feedback;

//         await studentAnswer.save();  // Save the updated student answer
//         console.log("Updated Student Answer:", answer);
//       }
//     }

//     console.log("Evaluation completed for all students.");
//     res.json({ message: 'Evaluation completed for all students' });
//   } catch (error) {
//     console.error('Error evaluating submissions:', error);
//     res.status(500).json({ error: 'Failed to evaluate submissions' });
//   }
// });

// module.exports = router;

//version-2

const express = require('express');
const router = express.Router();
const StudentAnswer = require('../model/stdanser');
const Question = require('../model/question');
const Test = require('../model/test');
const sendToAIModel = require('./sendToAIModel');  // AI Model integration
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Utility function to verify GridFS file exists
async function verifyGridFSFile(gfs, fileId) {
  try {
    const files = await gfs.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    console.log('GridFS file verification:', {
      fileId: fileId,
      filesFound: files.length,
      fileDetails: files.length > 0 ? files[0] : null
    });
    return files.length > 0;
  } catch (error) {
    console.error('GridFS file verification error:', {
      fileId: fileId,
      error: error.message
    });
    return false;
  }
}

// Utility function to download GridFS file
async function downloadGridFSFile(gfs, fileId, outputPath) {
  return new Promise((resolve, reject) => {
    const downloadStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    const writeStream = fs.createWriteStream(outputPath);

    downloadStream.pipe(writeStream);

    downloadStream.on('error', (error) => {
      console.error('GridFS download stream error:', {
        fileId: fileId,
        error: error.message
      });
      reject(error);
    });

    writeStream.on('error', (error) => {
      console.error('File write stream error:', {
        outputPath: outputPath,
        error: error.message
      });
      reject(error);
    });

    writeStream.on('finish', () => {
      console.log('Textbook downloaded successfully:', {
        fileId: fileId,
        outputPath: outputPath
      });
      resolve();
    });
  });
}

// Evaluate all students for a specific test
router.post('/:examId', async (req, res) => {
  const { examId } = req.params;
  const { relevance, completeness, language_quality } = req.body; // Criteria from frontend

  let textbookPath = null;
  let gfs = null;

  try {
    console.log("Evaluation process started!", { 
      examId, 
      criteria: { relevance, completeness, language_quality } 
    });

    // Fetch the test to get textbook and questions
    const test = await Test.findOne({ _id: examId }).populate('questions');
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const textbookFileId = test.textbook; // GridFS ID or reference
    if (!textbookFileId) {
      return res.status(404).json({ error: 'Textbook not found for this test' });
    }

    // Initialize GridFS
    gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

    // Verify file exists in GridFS
    const fileExists = await verifyGridFSFile(gfs, textbookFileId);
    if (!fileExists) {
      return res.status(404).json({ 
        error: 'Textbook file not found in GridFS',
        fileId: textbookFileId
      });
    }

    // Prepare temporary file path
    textbookPath = path.join(__dirname, `temp-${examId}-textbook.pdf`);

    // Download the textbook file
    await downloadGridFSFile(gfs, textbookFileId, textbookPath);

    // Verify file was downloaded
    if (!fs.existsSync(textbookPath)) {
      throw new Error('Failed to download textbook file');
    }

    // Fetch all student answers for this test
    const studentAnswers = await StudentAnswer.find({ testId: test._id }).populate('answers.questionId');

    // Iterate over each student's answers and evaluate them using the AI model
    for (const studentAnswer of studentAnswers) {
      console.log("Evaluating for Student:", studentAnswer.studentId);

      for (const answer of studentAnswer.answers) {
        const question = await Question.findById(answer.questionId);
        if (!question) {
          console.warn("Question not found for Answer:", answer);
          continue;
        }

        // Prepare data for the AI model
        const requestData = {
          studentAnswer: answer.studentAnswer,
          teacherAnswer: question.teacherAnswer,
          question: question.questionText,
          maxmarks : question.maxScore,
          referencePDF: textbookPath,
          criteria: { relevance, completeness, language_quality },
        };

        try {
          // Call AI model for evaluation
          const aiResponse = await sendToAIModel(requestData);

          // Update student's answer with the grade and reason
          answer.score = aiResponse.score;
          answer.reasonForGrade = aiResponse.feedback;

          await studentAnswer.save();
        } catch (aiModelError) {
          console.error('AI Model Evaluation Error:', {
            studentId: studentAnswer.studentId,
            questionId: answer.questionId,
            error: aiModelError.message
          });
          // Optionally, set a default score or skip this answer
          answer.score = 0;
          answer.reasonForGrade = 'Evaluation failed';
          await studentAnswer.save();
        }
      }
    }

    // Clean up the temporary file
    try {
      if (textbookPath && fs.existsSync(textbookPath)) {
        fs.unlinkSync(textbookPath);
        console.log("Temporary textbook file deleted:", textbookPath);
      }
    } catch (cleanupError) {
      console.error('Error deleting temporary file:', cleanupError);
    }

    res.json({ 
      message: 'Evaluation completed for all students',
      processedStudents: studentAnswers.length
    });

  } catch (error) {
    console.error('Comprehensive Error in evaluation:', {
      error: error.message,
      stack: error.stack,
      examId: examId
    });

    // Clean up temporary file in case of error
    if (textbookPath && fs.existsSync(textbookPath)) {
      try {
        fs.unlinkSync(textbookPath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file during error handling:', cleanupError);
      }
    }

    res.status(500).json({ 
      error: 'Failed to evaluate submissions', 
      details: error.message 
    });
  }
});

module.exports = router;