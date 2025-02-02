// Home.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Home.css';
import { AiOutlineUser } from 'react-icons/ai'; // Profile icon

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:5000/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        console.log("Fetched Users:", data);

        setUsers(data); 
        setError(null); 
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        setUsers([]);
      } finally {
        setLoading(false); // Ensure loading is false regardless of success or error
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!loading && !error && users.length === 0) {
      navigate('/signup');
    }
  }, [users, loading, error, navigate]);

  return (
    <div>
      <h1>Welcome to the Van Dating App</h1>

      {location.state?.message && <p className="success-message">{location.state.message}</p>}

      <h2>Users</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="error-message">Error: {error}</p>
      ) : users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id} className="user-item">
              <Link to={`/profile/${user.id}`}>
                <img
                  src={user.photo || 'default-photo.jpg'}
                  alt={user.name}
                  className="profile-photo"
                />
              </Link>
              <Link to={`/profile/${user.id}`}>
                {user.name} ({user.age}) - {user.bio}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users available. Redirecting to sign up...</p>
      )}

      {/* Floating Profile Edit Button */}
      <AiOutlineUser 
        className="floating-profile-icon" 
        onClick={() => navigate('/profile-edit')} 
      />
    </div>
  );
};

export default Home;
