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
            <div className="modal">
              <div className="modal-content">
                <h2 className="text-2xl font-bold mb-4">Edit Scores and Feedback</h2>
                <ul>
                  {selectedStudentAnswers.answers.map((answer, index) => (
                    <li key={index} className="mb-4">
                      <strong>Q:</strong> {answer.questionId.questionText} <br />
                      <strong>Student Answer:</strong> {answer.studentAnswer} <br />
                      <label>
                        <strong>Score:</strong>{' '}
                        <input
                          type="number"
                          value={answer.score || 0}
                          onChange={(e) =>
                            handleAnswerChange(index, 'score', Number(e.target.value))
                          }
                          className="border border-gray-300 p-2 rounded"
                        />
                      </label>
                      <br />
                      <label>
                        <strong>Reason:</strong>{' '}
                        <input
                          type="text"
                          value={answer.reasonForGrade}
                          onChange={(e) =>
                            handleAnswerChange(index, 'reasonForGrade', e.target.value)
                          }
                          className="border border-gray-300 p-2 rounded"
                        />
                      </label>
                    </li>
                  ))}
                </ul>
                <label>
                  <strong>Overall Feedback:</strong>{' '}
                  <textarea
                    value={selectedStudentAnswers.overallfeedback || ''}
                    onChange={(e) => handleOverallFeedbackChange(e.target.value)}
                    className="border border-gray-300 p-2 rounded w-full"
                  />
                </label>
                <button
                  onClick={saveModalChanges}
                  className="bg-green-500 text-white py-2 px-4 mt-4 rounded hover:bg-green-700 transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-500 text-white py-2 px-4 mt-4 rounded hover:bg-red-700 transition-all"
                >
                  Close
                </button>
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
