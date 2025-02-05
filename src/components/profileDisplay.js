import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProfileDisplay = () => {
  const { userId } = useParams();  
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    console.log("User ID from URL:", userId);

    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data); // Set user data
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      console.error("No userId found in URL.");
    }
  },[userId]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-display-container">
      <h1>{userData.name}'s Profile</h1>
      <p>Age: {userData.age}</p>
      <p>Bio: {userData.bio}</p>
    </div>
  );
};

export default ProfileDisplay;
