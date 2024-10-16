import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    userType: 'student', // Default to student
    idno: '', // ID Number field
    secretcode: '' // Secret Code field for teachers only
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Prepare data to send
      const requestData = {
        Fullname: formData.fullName, 
        email: formData.email,
        password: formData.password,
        isteacher: formData.userType === 'teacher', // Handle teacher logic
        idno: formData.idno,
        secretcode: formData.userType === 'teacher' ? formData.secretcode : undefined, // Send secretcode only if teacher
      };

      await axios.post('http://localhost:3000/signup', requestData);
      navigate('/login');  // Redirect to login after successful signup
    } catch (err) {
      setError('Failed to create an account. Please try again.');
    }
  };

  return (
    <div className="signup-page">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="idno">ID Number</label>
          <input
            type="text"
            id="idno"
            name="idno"
            value={formData.idno}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userType">Account Type</label>
          <select
            id="userType"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        {formData.userType === 'teacher' && (
          <div className="form-group">
            <label htmlFor="secretcode">Teacher Secret Code</label>
            <input
              type="text"
              id="secretcode"
              name="secretcode"
              value={formData.secretcode}
              onChange={handleChange}
              required
            />
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit">Signup</button>
      </form>
      <p>Already have an account? <a href="/login">Login here</a></p>
    </div>
  );
};

export default Signup;
