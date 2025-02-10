// Home.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Home.css';
import { AiOutlineUser } from 'react-icons/ai'; // Profile icon
import ProfileDisplay from './profileDisplay'; // Import ProfileDisplay

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null); // Store logged-in user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all users and the logged-in user
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

        // Assume the logged-in user has an ID of 1 for demonstration
        const loggedInResponse = await fetch('http://127.0.0.1:5000/api/users/1');
        const loggedInData = await loggedInResponse.json();
        setLoggedInUser(loggedInData); // Store logged-in user data

      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        setUsers([]);
      } finally {
        setLoading(false); 
      }
    };

    fetchUsers();
  }, []);

  // Redirect to signup if no users exist
  useEffect(() => {
    if (!loading && !error && users.length === 0) {
      navigate('/signup');
    }
  }, [users, loading, error, navigate]);

  return (
    <div>
      <h1>Welcome to the Van Dating App</h1>

      {location.state?.message && <p className="success-message">{location.state.message}</p>}

      {/* Profile Icon for Logged-in User */}
      {loggedInUser && (
        <AiOutlineUser 
          className="floating-profile-icon"
          onClick={() => navigate(`/profile/edit/${loggedInUser.id}`)} 
        />
      )}

      <h2>Users</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="error-message">Error: {error}</p>
      ) : users.length > 0 ? (
        <ul>
          {users
            .filter((user) => user.id !== loggedInUser?.id) // Exclude logged-in user
            .map((user) => (
              <li key={user.id} className="user-item">
                <Link to={`/profile/${user.id}`}>
                  {user.name} ({user.age}) - {user.bio}
                </Link>
              </li>
            ))}
        </ul>
      ) : (
        <p>No users available. Redirecting to sign up...</p>
      )}

      {/* Display Profile */}
      <ProfileDisplay users={users.length > 0 ? users : []} />
      

    </div>
  );
}

export default Home;