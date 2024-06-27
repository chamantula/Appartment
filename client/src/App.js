import React, { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserPage from './components/UserPage';
import './App.css';

const App = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoginLoggedIn, setIsLoginLoggedIn] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    fetchBackgroundImage();
  }, []);

  const fetchBackgroundImage = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/latest-image`);
      const data = await response.json();
      setBackgroundImage(data.imagePath);
    } catch (error) {
      console.error('Error fetching background image:', error);
    }
  };
  const handleHeaderClick = () => {
    setShowOptions(true);
  };

  const handleOptionClick = (option) => {
    if (option === 'register') {
      setShowRegister(true);
      setShowLogin(false);
      setShowAdmin(false);
    } else if (option === 'login') {
      setShowLogin(true);
      setShowRegister(false);
      setShowAdmin(false);
    } else if (option === 'admin') {
      setShowAdmin(true);
      setShowRegister(false);
      setShowLogin(false);
    }

    // Handle other options if needed
  };
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setShowAdmin(false);
  };
  const handleLoginSuccess = () => {
    setIsLoginLoggedIn(true);
    setShowLogin(false);
  };

  return (
    <div 
      className="App"
      style={{ backgroundImage: `url(${process.env.REACT_APP_BACKEND_URL}${backgroundImage})` }}
    >
      <div className="wishes">Wishes Box</div>
      <div className="advertisement">Advertisements here</div>
      <div className="content">
        <div className="header" onClick={handleHeaderClick}>
          <div className="apartment-name">Apartment Name</div>
        </div>
        {showOptions && (
          <div className="options">
            <button onClick={() => handleOptionClick('admin')}>Admin</button>
            <button onClick={() => handleOptionClick('register')}>Register</button>
            <button onClick={() => handleOptionClick('login')}>Login</button>
            <button onClick={() => handleOptionClick('guest')}>Guest Login</button>
          </div>
        )}
        {showRegister && <Register />}
        {showLogin && <Login onLoginSuccess={handleLoginSuccess} />}
	{isLoginLoggedIn && <UserPage />}
	{showAdmin && <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />}
        {isAdminLoggedIn && <AdminDashboard />}
      </div>
    </div>
  );
};

export default App;

