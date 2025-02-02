import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import SignUp from './components/SignUp';
import Login from './components/Login';
import ProfileEdit from './components/profileEdit';
import ProfileDisplay from './components/profileDisplay';

const App = () => {
  const [users, setUsers] = useState(() => {
    // Load users from localStorage if available
    return JSON.parse(localStorage.getItem('users')) || [];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('currentUser'));
  });

  useEffect(() => {
    // Whenever the authentication state or users change, update localStorage
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
    <Router>
      <Routes>
        {/* Redirect to Home if authenticated, otherwise show SignUp */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <SignUp addUser={addUser} />} />
        <Route path="/home" element={<Home users={users} />} />
        <Route path="/profile/:userId" element={<ProfileDisplay />} />
        <Route path="/login" element={<Login users={users} />} />
        <Route path="/profile/edit/:userId" element={<ProfileEdit />} />
        </Routes>
    </Router>
  );
};

export default App;
