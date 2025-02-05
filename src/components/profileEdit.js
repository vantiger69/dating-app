import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProfileEdit = () => {
  const { userId } = useParams();  
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem('userId');  

  const [userData, setUserData] = useState({
    name: '',
    age: '',
    bio: ''
  });

  useEffect(() => {
    console.log("Logged In User ID (from localStorage):", loggedInUserId);
    console.log("Profile User ID (from URL):", userId);
  
    // Fetch user data and handle redirection only if necessary
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
  
          if (parseInt(userId) !== parseInt(data.id)) {
            console.log("Redirecting due to ID mismatch...");
            navigate('/login');
          }
        } else {
          console.error("Failed to fetch user data");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
        navigate("/login");
      }
    };
  
    if (userId) {
      fetchUserData();
    }
  }, [userId, navigate]);
   
         

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        console.log('User data updated successfully');
        navigate(`/profile/${userId}`); // Redirect to profile display
      } else {
        console.error('Failed to update user data');
      }
    } catch (error) {
      console.error('Error updating user data: ', error);
    }
  };

  return (
    <div className="profile-edit-container">
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={userData.name}
          onChange={handleChange}
        />

        <label>Age:</label>
        <input
          type="number"
          name="age"
          value={userData.age}
          onChange={handleChange}
        />

        <label>Bio:</label>
        <textarea
          name="bio"
          value={userData.bio}
          onChange={handleChange}
        />

        <button type="submit">Save Changes</button>
      </form>
      <button onClick={() => navigate(`/profile/${userId}`)}>Cancel</button>
    </div>
  );
};

export default ProfileEdit;
