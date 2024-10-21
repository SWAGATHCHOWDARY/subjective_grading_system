import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
            'Authorization': `Bearer ${token}`
          }
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
    <div className="view-grades-page">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Your Grades</h2>
        <button
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Test ID</th>
            <th className="py-2 px-4 border">Grade</th>
            <th className="py-2 px-4 border">Reason for Grade</th>
          </tr>
        </thead>
        <tbody>
          {grades.length > 0 ? (
            grades.map((exam) => (
              <tr key={exam.testId}>
                <td className="py-2 px-4 border">{exam.testId}</td>
                <td className="py-2 px-4 border">{exam.grade}</td>
                <td className="py-2 px-4 border">{exam.reasonForGrade}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4">No grades available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewGrades;