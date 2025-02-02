import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    age: '',
    bio: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (newUser.name && newUser.email && newUser.age && newUser.password) {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        const response = await fetch('http://localhost:5000/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Signup failed. Please try again.');
        }

        const result = await response.json();
        console.log('User signed up:', result);

        navigate('/home', { state: { message: 'Signup Successful!' } });
      } catch (error) {
        setError(error.message); 
      } finally {
        setLoading(false); 
      }
    } else {
      alert('Please fill out all required fields.');
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          name="name"
          value={newUser.name}
          onChange={handleInputChange}
          placeholder="Name"
          required
        />
        <input
          type="email"
          name="email"
          value={newUser.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />
        <input
          type="number"
          name="age"
          value={newUser.age}
          onChange={handleInputChange}
          placeholder="Age"
          required
        />
        <textarea
          name="bio"
          value={newUser.bio}
          onChange={handleInputChange}
          placeholder="Write a brief bio about yourself"
          required
        />
        <input
          type="password"
          name="password"
          value={newUser.password}
          onChange={handleInputChange}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : error ? 'Signup failed. Please try again.' : 'Sign Up'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <div>
        <p>Already have an account?</p>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    </div>
  );
};

export default SignUp;
