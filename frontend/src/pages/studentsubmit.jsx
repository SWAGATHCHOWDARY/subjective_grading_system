// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './SubmitExam.css';  // Importing custom CSS for additional styling

// const SubmitExam = () => {
//   const [testId, setTestId] = useState('');
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   let navigate = useNavigate();

//   const studentId = localStorage.getItem('userid');

//   const handleTestIdSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch(`http://localhost:3000/exam/get-exam-questions/${testId}`);
//       const data = await response.json();

//       if (response.ok) {
//         setQuestions(data.questions);
//       } else {
//         setError(data.error || 'Error fetching questions');
//       }
//     } catch (err) {
//       setError('Error fetching exam data: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAnswerChange = (index, value) => {
//     setAnswers({ ...answers, [index]: value });
//   };

//   const handleSubmitAnswers = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const submissionData = {
//       testId,
//       studentId,
//       answers: questions.map((question, index) => ({
//         questionId: question.id,  // Assuming the backend provides question IDs
//         studentAnswer: answers[index],  // The student's answer text
//       }))
//     };

//     try {
//       const response = await fetch('http://localhost:3000/exam/submit-exam', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',  // Set the content type as JSON
//         },
//         body: JSON.stringify(submissionData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('Answers submitted successfully');
//         navigate('/student/dashboard');
//       } else {
//         setError(data.error || 'Error submitting answers');
//       }
//     } catch (err) {
//       setError('Error submitting answers: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="submit-exam container mx-auto p-6 bg-white rounded-lg shadow-lg">
//       <h2 className="text-3xl font-bold text-center mb-6">Submit Your Exam</h2>

//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       <form onSubmit={handleTestIdSubmit} className="space-y-6">
//         <div className="form-group">
//           <label htmlFor="testId" className="block text-sm font-medium text-gray-700">
//             Enter Test ID:
//           </label>
//           <input
//             type="text"
//             id="testId"
//             value={testId}
//             onChange={(e) => setTestId(e.target.value)}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//           />
//         </div>

//         <button
//           type="submit"
//           className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
//           disabled={loading}
//         >
//           {loading ? 'Fetching Questions...' : 'Submit Test ID'}
//         </button>
//       </form>

//       {questions.length > 0 && (
//         <form onSubmit={handleSubmitAnswers} className="space-y-6 mt-6">
//           {questions.map((question, index) => (
//             <div key={index} className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 {`Question ${index + 1}: ${question.questionText}`}
//               </label>
//               <textarea
//                 value={answers[index] || ''}
//                 onChange={(e) => handleAnswerChange(index, e.target.value)}
//                 required
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//                 placeholder="Enter your answer here"
//                 rows="4"
//               />
//             </div>
//           ))}

//           <button
//             type="submit"
//             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
//             disabled={loading}
//           >
//             {loading ? 'Submitting Answers...' : 'Submit Answers'}
//           </button>
//         </form>
//       )}
//     </div>
//   );
// };

// export default SubmitExam;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubmitExam.css'; // Importing custom CSS for additional styling

const SubmitExam = () => {
  const [testId, setTestId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState({}); // For individual question loading states
  let navigate = useNavigate();

  const studentId = localStorage.getItem('userid');

  const handleTestIdSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/exam/get-exam-questions/${testId}`);
      const data = await response.json();

      if (response.ok) {
        setQuestions(data.questions);
      } else {
        setError(data.error || 'Error fetching questions');
      }
    } catch (err) {
      setError('Error fetching exam data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleImageUpload = async (index, file) => {
    setLoadingQuestions((prev) => ({ ...prev, [index]: true }));
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:3000/perform-ocr', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setAnswers((prevAnswers) => ({
          ...prevAnswers,
          [index]: data.extracted_text || '', // Update the respective answer with OCR result
        }));
      } else {
        setError(data.error || 'Error processing image');
      }
    } catch (err) {
      setError('Error processing image: ' + err.message);
    } finally {
      setLoadingQuestions((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleSubmitAnswers = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submissionData = {
      testId,
      studentId,
      answers: questions.map((question, index) => ({
        questionId: question.id, // Assuming the backend provides question IDs
        studentAnswer: answers[index], // The student's answer text
      })),
    };

    try {
      const response = await fetch('http://localhost:3000/exam/submit-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set the content type as JSON
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Answers submitted successfully');
        navigate('/student/dashboard');
      } else {
        setError(data.error || 'Error submitting answers');
      }
    } catch (err) {
      setError('Error submitting answers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-exam container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Submit Your Exam</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Test ID Submission Form */}
      <form onSubmit={handleTestIdSubmit} className="space-y-6">
        <div className="form-group">
          <label htmlFor="testId" className="block text-sm font-medium text-gray-700">
            Enter Test ID:
          </label>
          <input
            type="text"
            id="testId"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
          />
        </div>

        <button
          type="submit"
          className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
          disabled={loading}
        >
          {loading ? 'Fetching Questions...' : 'Submit Test ID'}
        </button>
      </form>

      {/* Questions and Answers Form */}
      {questions.length > 0 && (
        <form onSubmit={handleSubmitAnswers} className="space-y-6 mt-6">
          {questions.map((question, index) => (
            <div key={index} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {`Question ${index + 1}: ${question.questionText}`}
              </label>
              <textarea
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                placeholder="Enter your answer here"
                rows="4"
              />
              <div className="mt-2 flex items-center space-x-4">
                <label
                  htmlFor={`upload-image-${index}`}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  {loadingQuestions[index] ? 'Processing...' : 'Upload Image'}
                </label>
                <input
                  type="file"
                  id={`upload-image-${index}`}
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
            disabled={loading}
          >
            {loading ? 'Submitting Answers...' : 'Submit Answers'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SubmitExam;

