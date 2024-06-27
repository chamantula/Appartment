import React, { useState, useEffect } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apartmentId, setApartmentId] = useState('');
  const [apartmentIds, setApartmentIds] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    // Fetch apartment IDs from the server
    const fetchApartmentIds = async () => {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/apartments`);
      const data = await response.json();
      setApartmentIds(data);
    };

    fetchApartmentIds();
  }, []);

  const handleLogin = async (e) => {
    try {

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/login`, {
      	method: 'POST',
      	headers: {
        	'Content-Type': 'application/json',
      	},
      	body: JSON.stringify({ email, password, apartmentId }),
      });
      if (response.ok) {
        onLoginSuccess();
      } else {
        const message = await response.text();
        setError(`Failed to login: ${message}`);
      }
    } catch (err) {
      console.error('Failed to login:', err);
      setError('Failed to login');
    }
  };
    

  return (
    <div>
      <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          value={apartmentId}
          onChange={(e) => setApartmentId(e.target.value)}
        >
          <option value="">Select Apartment</option>
          {apartmentIds.map((apt) => (
            <option key={apt.Id} value={apt.Id}>
              {apt.Name} (ID: {apt.Id})
            </option>
          ))}
        </select>
        <button onClick={handleLogin}>Login</button>
	{error && <p>{error}</p>}  
    </div>
  );
};

export default Login;

