// src/pages/TeacherGradesPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const TeacherGradesPage = () => {
  const [studentGrades, setStudentGrades] = useState([]);
  const history = useHistory();

  // Load all student grades
  useEffect(() => {
    const fetchStudentGrades = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teacher/grades');
        setStudentGrades(response.data);
      } catch (error) {
        console.error('Failed to fetch student grades', error);
      }
    };
    fetchStudentGrades();
  }, []);

  // Update a student's grade
  const handleGradeChange = (gradeId, newGrade) => {
    setStudentGrades((prevGrades) =>
      prevGrades.map((grade) =>
        grade._id === gradeId ? { ...grade, updatedGrade: newGrade } : grade
      )
    );
  };

  const updateGrade = async (gradeId, updatedGrade) => {
    try {
      await axios.put(`http://localhost:5000/api/teacher/update-grade/${gradeId}`, {
        updatedGrade,
      });
      alert('Grade updated successfully.');
    } catch (error) {
      alert('Failed to update grade.');
      console.error(error);
    }
  };

  return (
    <div className="teacher-grades-page">
      <h2>Student Grades Dashboard</h2>
      {studentGrades.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Question</th>
              <th>AI Grade</th>
              <th>Reason</th>
              <th>Official Answer</th>
              <th>Change Grade</th>
            </tr>
          </thead>
          <tbody>
            {studentGrades.map((grade) => (
              <tr key={grade._id}>
                <td>{grade.studentName}</td>
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
                <td>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={grade.updatedGrade || grade.grade}
                    onChange={(e) => handleGradeChange(grade._id, e.target.value)}
                  />
                  <button
                    onClick={() => updateGrade(grade._id, grade.updatedGrade || grade.grade)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No student submissions available yet.</p>
      )}

      <button onClick={() => history.push('/teacher/dashboard')}>Back to Dashboard</button>
      <button onClick={() => history.push('/logout')}>Logout</button>
    </div>
  );
};

export default TeacherGradesPage;
