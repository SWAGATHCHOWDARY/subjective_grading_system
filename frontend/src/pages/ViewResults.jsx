import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ViewResults.css';

const ViewResults = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentAnswers, setSelectedStudentAnswers] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const { examId } = useParams(); // Retrieve examId from route params
  const navigate = useNavigate();

  // Fetch results on component mount
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/view-results/${examId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStudents(data.students); // Set students' data
        } else {
          setError('Error fetching results');
        }
      } catch (err) {
        setError('Failed to fetch results: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [examId]);

  // Handle student row click to fetch their answers
  const handleStudentClick = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/student-answers/${examId}/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setSelectedStudentAnswers({ ...data, studentId }); // Include studentId for updates
        setShowModal(true); // Show modal with fetched data
      } else {
        setError('Failed to fetch student answers');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  // Handle input change in the modal
  const handleAnswerChange = (index, field, value) => {
    const updatedAnswers = [...selectedStudentAnswers.answers];
    updatedAnswers[index][field] = value;
    setSelectedStudentAnswers({
      ...selectedStudentAnswers,
      answers: updatedAnswers,
    });
  };

  // Handle overall feedback change
  const handleOverallFeedbackChange = (value) => {
    setSelectedStudentAnswers({
      ...selectedStudentAnswers,
      overallfeedback: value,
    });
  };

  // Save modal changes and update total score
  const saveModalChanges = async () => {
    try {
      const token = localStorage.getItem('token');

      // Calculate the total score
      const updatedTotalScore = selectedStudentAnswers.answers.reduce(
        (sum, q) => sum + (q.score || 0),
        0
      );

      const response = await fetch(
        `http://localhost:3000/student-answers/${examId}/${selectedStudentAnswers.studentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers: selectedStudentAnswers.answers,
            totalScore: updatedTotalScore,
            overallfeedback: selectedStudentAnswers.overallfeedback, // Send updated feedback
          }),
        }
      );

      if (response.ok) {
        setSaveStatus('Changes saved successfully!');
        setShowModal(false);

        // Update main table with the new total score and feedback
        setStudents((prev) =>
          prev.map((student) =>
            student.studentId === selectedStudentAnswers.studentId
              ? {
                  ...student,
                  totalScore: updatedTotalScore,
                  overallfeedback: selectedStudentAnswers.overallfeedback,
                }
              : student
          )
        );
      } else {
        setSaveStatus('Failed to save changes.');
      }
    } catch (err) {
      setSaveStatus('Error: ' + err.message);
    }
  };

  return (
    <div className="view-results-page container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">View and Edit Results</h2>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition-all duration-300"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </header>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {saveStatus && <p className="text-green-500 mb-4">{saveStatus}</p>}

          {showModal && selectedStudentAnswers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="modal-content bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 my-8 p-6 relative">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-2 right-2 p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
              Edit Scores and Feedback for Student
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div className="question-list max-h-[400px] overflow-y-auto pr-4">
                {selectedStudentAnswers.answers.map((answer, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm border border-gray-200"
                  >
                    <div className="mb-3">
                      <p className="font-semibold text-gray-700 mb-2">
                        Question: {answer.questionId.questionText}
                      </p>
                      <p className="text-gray-600 mb-3">
                        <strong>Student Answer:</strong> {answer.studentAnswer}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Score
                        </label>
                        <input
                          type="number"
                          value={answer.score || 0}
                          onChange={(e) =>
                            handleAnswerChange(index, 'score', Number(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Grade
                        </label>
                        <textarea
                          value={answer.reasonForGrade}
                          onChange={(e) =>
                            handleAnswerChange(index, 'reasonForGrade', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter reason for the grade..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Feedback
                </label>
                <input
                  type="text"
                  value={selectedStudentAnswers.overallfeedback || ''}
                  onChange={(e) => handleOverallFeedbackChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter overall feedback for the student..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveModalChanges}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-6 border-b-2 text-left text-gray-600">Student Name</th>
                <th className="py-3 px-6 border-b-2 text-left text-gray-600">Final Score</th>
                <th className="py-3 px-6 border-b-2 text-left text-gray-600">Overall Feedback</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student.studentId || index} className="hover:bg-gray-50 transition-all">
                    <td
                      className="py-3 px-6 border-b cursor-pointer text-blue-500 hover:underline"
                      onClick={() => handleStudentClick(student.studentId)}
                    >
                      {student.studentName}
                    </td>
                    <td className="py-3 px-6 border-b">{student.totalScore}</td>
                    <td className="py-3 px-6 border-b">{student.overallfeedback}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No results available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ViewResults;
