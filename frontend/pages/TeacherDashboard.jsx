// src/pages/TeacherDashboard.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const TeacherDashboard = () => {
  const [studentGrades, setStudentGrades] = useState([]);
  const [file, setFile] = useState(null);
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

  // Handle official answer upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await axios.post('http://localhost:5000/api/teacher/upload-answer', formData);
      alert('Official answer uploaded successfully.');
    } catch (error) {
      alert('Failed to upload official answer.');
      console.error(error);
    }
  };

  return (
    <div className="teacher-dashboard">
      <h2>Welcome, Teacher</h2>

      {/* Official Answer Upload Section */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fileUpload">Upload Official Answer File</label>
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            accept=".pdf,.docx"
          />
        </div>
        <button type="submit">Submit</button>
      </form>

      {/* Grades Dashboard */}
      <div className="grades-dashboard">
        <h3>Student Grades Dashboard</h3>
        {studentGrades.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Question</th>
                <th>AI Grade</th>
                <th>Reason</th>
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
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={grade.updatedGrade || grade.grade}
                      onChange={(e) =>
                        setStudentGrades((prevGrades) =>
                          prevGrades.map((g) =>
                            g._id === grade._id ? { ...g, updatedGrade: e.target.value } : g
                          )
                        )
                      }
                    />
                    <button
                      onClick={async () => {
                        try {
                          await axios.put(`http://localhost:5000/api/teacher/update-grade/${grade._id}`, {
                            updatedGrade: grade.updatedGrade || grade.grade,
                          });
                          alert('Grade updated successfully.');
                        } catch (error) {
                          alert('Failed to update grade.');
                        }
                      }}
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
      </div>

      <button onClick={() => history.push('/logout')}>Logout</button>
    </div>
  );
};

export default TeacherDashboard;
