import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, BrowserRouter } from 'react-router-dom';
import Home from './components/Home';
import SignUp from './components/SignUp';
import Login from './components/Login';
import ProfileEdit from './components/profileEdit';
import ProfileDisplay from './components/profileDisplay';

const App = () => {
  const [users, setUsers] = useState(() => {
    return JSON.parse(localStorage.getItem('users')) || [];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('currentUser', JSON.stringify(users[users.length - 1]));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [isAuthenticated, users]);

  const addUser = (user) => {
    setUsers((prevUsers) => {
      const updatedUsers = [...prevUsers, { ...user, id: prevUsers.length + 1 }];
      return updatedUsers;
    });
    setIsAuthenticated(true); // Mark the user as authenticated
  };

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || '/'}>
      <Routes>
        {/* Root route to redirect based on authentication */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/signup" />} />

        {/* Explicit signup route */}
        <Route path="/signup" element={<SignUp addUser={addUser} />} />

        {/* Other routes */}
        <Route path="/home" element={<Home users={users} />} />
        <Route path="/profile/:userId" element={<ProfileDisplay />} />
        <Route path="/login" element={<Login users={users} />} />
        <Route path="/profile/edit/:userId" element={<ProfileEdit />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
