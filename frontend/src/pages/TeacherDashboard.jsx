import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './TeacherDashboard.css';  

const TeacherDashboard = () => {
  const [fullname, setFullname] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the fullname from localStorage
    const storedFullname = localStorage.getItem('fullname');
    if (storedFullname) {
      setFullname(storedFullname);
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage and navigate to login
    localStorage.removeItem('token');
    localStorage.removeItem('fullname');
    navigate('/logout');
  };

  return (
    <div className="teacher-dashboard">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Welcome, {fullname}</h2>
        <button 
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {/* Button Section */}
      <div className="flex justify-around mb-8">
        <Link to="/upload-exam" className="bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-700">
          Upload Exam
        </Link>
        <Link to="/evaluate-submissions" className="bg-green-500 text-white py-3 px-6 rounded hover:bg-green-700">
          Evaluate Submissions
        </Link>
      </div>
    </div>
  );
};

export default TeacherDashboard;
