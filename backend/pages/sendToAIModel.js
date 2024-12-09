const axios = require('axios');

// Function to send data to the AI model and get the grade and reason
const sendToAIModel = async (data) => {
  try {
    // Call the Flask API for AI evaluation
    console.log("Data at SendtoAI",data)
    const response = await axios.post('http://localhost:5000/evaluate', data);  // Flask AI service endpoint
    
    // Return the grade and reason from the AI model
    return response.data;  // { grade: 'A', reason: 'Reason for the grade' }
  } catch (error) {
    console.error('Error calling AI model:', error);
    throw new Error('AI model evaluation failed');
  }
};

module.exports = sendToAIModel;
