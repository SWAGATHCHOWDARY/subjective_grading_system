// src/pages/StudentDashboard.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const StudentDashboard = () => {
  const [gradeDetails, setGradeDetails] = useState([]);
  const [file, setFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
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

  // Handle file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setStatusMessage('Uploading...');
      await axios.post('http://localhost:5000/api/student/upload', formData);
      setStatusMessage('File uploaded successfully and under evaluation.');
    } catch (error) {
      setStatusMessage('Failed to upload file.');
      console.error(error);
    }
  };

  return (
    <div className="student-dashboard">
      <h2>Welcome, Student</h2>

      {/* File Upload Section */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fileUpload">Upload Answer File</label>
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            accept=".pdf,.docx"
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {statusMessage && <p>{statusMessage}</p>}

      {/* Grades Overview */}
      <div className="grades-overview">
        <h3>Your Grades</h3>
        {gradeDetails.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Grade</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {gradeDetails.map((grade) => (
                <tr key={grade._id}>
                  <td>{grade.question}</td>
                  <td>{grade.grade}</td>
                  <td>{grade.reason}</td>
                  <td>{grade.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No grades available yet.</p>
        )}
      </div>

      <button onClick={() => history.push('/logout')}>Logout</button>
    </div>
  );
};

export default StudentDashboard;
