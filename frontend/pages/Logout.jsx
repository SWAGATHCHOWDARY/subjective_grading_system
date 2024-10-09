// src/pages/Logout.jsx

import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const Logout = () => {
  const history = useHistory();

  useEffect(() => {
    // Clear any user-related data from local storage or session
    localStorage.removeItem('userToken');
    localStorage.removeItem('userType');

    // Redirect to login page after logging out
    history.push('/login');
  }, [history]);

  return (
    <div className="logout-page">
      <h2>Logging Out...</h2>
    </div>
  );
};

export default Logout;
