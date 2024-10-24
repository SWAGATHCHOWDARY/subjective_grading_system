import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './viewgrade.css'; // Importing the CSS file for styling

const ViewGrades = () => {
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const studentId = localStorage.getItem('userid');
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:3000/student-grades/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGrades(data.grades);
        } else {
          setError('Error fetching grades');
        }
      } catch (err) {
        setError('Failed to fetch grades: ' + err.message);
      }
    };

    fetchGrades();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('fullname');
    localStorage.removeItem('userid');
    navigate('/logout');
  };

  return (
    <div className="view-grades-page container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Your Grades</h2>
        <button
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition-all duration-300"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="min-w-full bg-white border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-6 border-b-2 text-left text-gray-600">Test ID</th>
            <th className="py-3 px-6 border-b-2 text-left text-gray-600">Grade</th>
            <th className="py-3 px-6 border-b-2 text-left text-gray-600">Reason for Grade</th>
          </tr>
        </thead>
        <tbody>
          {grades.length > 0 ? (
            grades.map((exam) => (
              <tr key={exam.testId} className="hover:bg-gray-50 transition-all">
                <td className="py-3 px-6 border-b">{exam.testId}</td>
                <td className="py-3 px-6 border-b">{exam.grade}</td>
                <td className="py-3 px-6 border-b">{exam.reasonForGrade}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">
                No grades available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewGrades;
