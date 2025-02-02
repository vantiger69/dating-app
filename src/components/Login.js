import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json()
      console.log(data);
      

      if (response.ok) {
  //store the jwt token in localstorage
        localStorage.setItem('token',data.access_token);

        console.log(localStorage.getItem('token'));


        navigate('/Home',{state:{ message: 'Login successful!'}}); 
      } else {
        setError(data.error);
      }
    } catch (error) {
        setError('Something went wrong.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <p>Don't have an account?</p>
        <button onClick={() => navigate('/signup')}>Sign Up</button>
      </div>
    </div>
  );
};

export default Login;
