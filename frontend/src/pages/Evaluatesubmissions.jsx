import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EvaluateSubmissions.css'; // Import CSS for styling

const EvaluateSubmissions = () => {
  const [exams, setExams] = useState([]);  // State to store exam data (will be an array of exam objects)
  const [error, setError] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null); // Exam ID for the modal
  const [criteria, setCriteria] = useState({
    relevance: '',
    completeness: '',
    language_quality: '',
  }); // State for evaluation criteria
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
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

  const handleEvaluateClick = (examId) => {
    setSelectedExamId(examId); // Set the selected exam ID
    setIsModalOpen(true); // Open the modal
  };

  const handleCriteriaChange = (e) => {
    const { name, value } = e.target;
    setCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitEvaluation = async () => {
    if (!criteria.relevance || !criteria.completeness || !criteria.language_quality) {
      alert('Please fill in all criteria.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/evaluate/${selectedExamId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Evaluation completed successfully.');
      } else {
        alert('Evaluation failed.');
      }
    } catch (err) {
      alert('Evaluation failed.');
    } finally {
      setIsModalOpen(false); // Close the modal
      setCriteria({ relevance: '', completeness: '', language_quality: '' }); // Reset criteria
    }
  };

  const handleViewResults = (examId) => {
    // Navigate to the ViewResults page with examId in the URL
    navigate(`/view-results/${examId}`);
  };

  return (
    <div className="evaluate-submissions">
      <h2 className="text-2xl font-bold mb-6">Evaluate Submissions</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Exam Name</th>
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
                    onClick={() => handleEvaluateClick(exam._id)}
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

      {/* Modal for criteria input */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="text-lg font-bold mb-4">Enter Evaluation Criteria</h3>
            <div className="mb-2">
              <label className="block mb-1">Relevance:</label>
              <input
                type="number"
                name="relevance"
                value={criteria.relevance}
                onChange={handleCriteriaChange}
                className="border px-2 py-1 w-full"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Completeness:</label>
              <input
                type="number"
                name="completeness"
                value={criteria.completeness}
                onChange={handleCriteriaChange}
                className="border px-2 py-1 w-full"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Language Quality:</label>
              <input
                type="number"
                name="language_quality"
                value={criteria.language_quality}
                onChange={handleCriteriaChange}
                className="border px-2 py-1 w-full"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700 mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                onClick={handleSubmitEvaluation}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluateSubmissions;
