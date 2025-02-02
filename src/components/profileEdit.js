import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './profileEdit.css';

const ProfileEdit = () => {
  const { userId } = useParams();  // Get user ID from URL
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: '',
    age: '',
    bio: '',
    photo: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data); // Populate user data into form
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('age', userData.age);
    formData.append('bio', userData.bio);
    if (selectedFile) {
      formData.append('photo', selectedFile);
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        navigate(`/profile/${userId}`);  // Redirect to the user's profile page after saving changes
      } else {
        console.error("Failed to update user data");
      }
    } catch (error) {
      console.error("Update error: ", error);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}/photo`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setUserData((prevData) => ({ ...prevData, photo: '' }));
        alert("Profile photo deleted successfully.");
      } else {
        alert("Failed to delete profile photo.");
      }
    } catch (error) {
      console.error("Delete error: ", error);
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

        <label>Profile Photo:</label>
        {userData.photo && (
          <div>
            <img src={userData.photo} alt="Profile" className="profile-photo-preview" />
            <button type="button" onClick={handleDeletePhoto}>Delete Photo</button>
          </div>
        )}
        <input
          type="file"
          onChange={handleFileChange}
        />

        <button type="submit">Save Changes</button>
      </form>
      <button onClick={() => navigate(`/profile/${userId}`)}>Cancel</button>
    </div>
  );
};

export default ProfileEdit;
