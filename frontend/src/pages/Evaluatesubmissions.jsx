import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EvaluateSubmissions.css'; // Import CSS for styling

const EvaluateSubmissions = () => {
  const [exams, setExams] = useState([]);  // State to store exam data (will be an array of exam objects)
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch exams associated with the teacher
    const fetchExams = async () => {
      try {
        const teacherId = localStorage.getItem('userid');
        if (!teacherId) {
          throw new Error('Teacher ID not found. Please log in again.');
        }

        const response = await fetch(`http://localhost:3000/get-teacher-exams/${teacherId}`);
        const data = await response.json();

        if (response.ok) {
          setExams(data.exams);
        } else {
          setError(data.error || 'Failed to fetch exams');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchExams();
  }, []);

  const handleEvaluate = (examId) => {
    navigate(`/evaluate-exam/${examId}`);
  };

  const handleViewResults = (examId) => {
    navigate(`/view-results/${examId}`);
  };

  return (
    <div className="evaluate-submissions">
      <h2 className="text-2xl font-bold mb-6">Evaluate Submissions</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Exam Code</th>
            <th className="px-4 py-2">Evaluate</th>
            <th className="px-4 py-2">View Results</th>
          </tr>
        </thead>
        <tbody>
          {exams.length > 0 ? (
            exams.map((exam) => (
              <tr key={exam._id}>
                <td className="border px-4 py-2">{exam.testId}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                    onClick={() => handleEvaluate(exam._id)}
                  >
                    Evaluate
                  </button>
                </td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                    onClick={() => handleViewResults(exam._id)}
                  >
                    View Results
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-4">No exams available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EvaluateSubmissions;
