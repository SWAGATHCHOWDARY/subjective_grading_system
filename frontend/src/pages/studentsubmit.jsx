import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const SubmitExam = () => {
  const [testId, setTestId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();
  // Get the student ID from localStorage
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

  const handleAnswerChange = (index, file) => {
    setAnswers({ ...answers, [index]: file });
  };

  const handleSubmitAnswers = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('testId', testId);
    formData.append('studentId', studentId); // Include the student ID in the submission

    questions.forEach((question, index) => {
      if (answers[index]) {
        formData.append(`answers`, answers[index]); // This must match what the backend expects
      }
    });

    try {
      const response = await fetch('http://localhost:3000/exam/submit-exam', {
        method: 'POST',
        body: formData,
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
    }
  };

  return (
    <div className="submit-exam container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Submit Exam</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleTestIdSubmit} className="space-y-6">
        <div>
          <label htmlFor="testId" className="block text-sm font-medium text-gray-700">
            Enter Test ID:
          </label>
          <input
            type="text"
            id="testId"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <button
          type="submit"
          className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {loading ? 'Fetching Questions...' : 'Submit Test ID'}
        </button>
      </form>

      {questions.length > 0 && (
        <form onSubmit={handleSubmitAnswers} className="space-y-6 mt-6">
          {questions.map((question, index) => (
            <div key={index} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {`Question ${index + 1}: ${question.questionText}`}
              </label>
              <input
                type="file"
                onChange={(e) => handleAnswerChange(index, e.target.files[0])}
                className="mt-1 block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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