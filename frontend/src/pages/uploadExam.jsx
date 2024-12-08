import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadExam.css';

const UploadExam = () => {
  const [examCode, setExamCode] = useState('');
  const [questions, setQuestions] = useState([{ questionText: '', answerText: '' }]);
  const [textbook, setTextbook] = useState(null);
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedTeacherId = localStorage.getItem('userid');
    if (storedTeacherId) {
      setTeacherId(storedTeacherId);
    } else {
      setError('Teacher ID not found. Please log in again.');
    }
  }, []);

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', answerText: '' }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    const formData = new FormData();
    formData.append('examCode', examCode);
    formData.append('teacherId', teacherId);
  
    if (textbook) {
      formData.append('textbook', textbook);  // Append the textbook file
    }

    // Append questions as a JSON string
    const questionsData = questions.map(q => ({
      questionText: q.questionText,
      teacherAnswer: q.answerText,  // Send teacher's answer as part of each question
    }));
    formData.append('questions', JSON.stringify(questionsData));

    try {
      const response = await fetch('http://localhost:3000/upload-exam', {
        method: 'POST',
        body: formData,
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        setLoading(false);
        navigate('/teacher/dashboard');
      } else {
        setLoading(false);
        setError(responseData.error || 'Failed to upload exam');
      }
    } catch (error) {
      console.error('Error in fetch:', error);
      setLoading(false);
      setError('Error uploading exam: ' + error.message);
    }
  };

  return (
    <div className="upload-exam container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Upload Exam</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">Uploading, please wait...</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label htmlFor="examCode" className="block text-sm font-medium text-gray-700">
            Exam Name:
          </label>
          <input
            type="text"
            id="examCode"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="textbook" className="block text-sm font-medium text-gray-700">
            Upload Textbook (Optional):
          </label>
          <input
            type="file"
            id="textbook"
            onChange={(e) => setTextbook(e.target.files[0])}
            className="mt-1 block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
        </div>

        {questions.map((q, index) => (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Question {index + 1}:
            </label>
            <input
              type="text"
              value={q.questionText}
              onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter the question"
            />
            <textarea
              value={q.answerText}
              onChange={(e) => handleQuestionChange(index, 'answerText', e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter the model answer"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddQuestion}
          className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Another Question
        </button>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Submit Exam'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadExam;
