// src/pages/StudentGradesPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const StudentGradesPage = () => {
  const [gradeDetails, setGradeDetails] = useState([]);
  const history = useHistory();

  // Load student grades
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/student/grades');
        setGradeDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch grades', error);
      }
    };
    fetchGrades();
  }, []);

  return (
    <div className="student-grades-page">
      <h2>Your Grades</h2>
      {gradeDetails.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Grade</th>
              <th>Reason</th>
              <th>Official Answer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {gradeDetails.map((grade) => (
              <tr key={grade._id}>
                <td>{grade.question}</td>
                <td>{grade.grade}</td>
                <td>{grade.reason}</td>
                <td>
                  {grade.officialAnswer ? (
                    <a href={grade.officialAnswer} target="_blank" rel="noopener noreferrer">
                      View Official Answer
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{grade.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No grades available yet.</p>
      )}

      <button onClick={() => history.push('/student/dashboard')}>Back to Dashboard</button>
      <button onClick={() => history.push('/logout')}>Logout</button>
    </div>
  );
};

export default StudentGradesPage;
