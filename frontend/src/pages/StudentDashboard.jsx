import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './studentDashboard.css'; 

const StudentDashboard = () => {
  const [fullname,setFullname] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const storedFullname = localStorage.getItem('fullname');
    if (storedFullname){
      setFullname(storedFullname);
    }
  },[]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('fullname');
    navigate('/logout');
  };

  return (
    <div className="student-dashboard">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Welcome, {fullname}</h2>
        <button 
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <div className="flex justify-around mb-8">
        <Link to="/submit-exam" className="bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-700">
          Submit Exam
        </Link>
        <Link to="/view-grades" className="bg-green-500 text-white py-3 px-6 rounded hover:bg-green-700">
          View Grades
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
