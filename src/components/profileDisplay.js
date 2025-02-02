import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './profileDisplay.css';

const ProfileDisplay = () => {
  const { userId } = useParams();  // Get user ID from URL
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data); // Populate user data
      } else {
        console.error("Failed to fetch user data");
      }
    };

    fetchUserData();
  }, [userId]);

  if (!userData) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="profile-container">
      <h1>{userData.name}'s Profile</h1>
      <img src={userData.photo || 'default-photo.jpg'} alt={userData.name} />
      <p>Age: {userData.age}</p>
      <p>Bio: {userData.bio}</p>
      <button onClick={() => navigate(`/profile/edit/${userId}`)}>Edit Profile</button>
      <button onClick={() => navigate('/home')}>Back to Home</button>
    </div>
  );
};

export default ProfileDisplay;
