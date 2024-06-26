import React, { useState, useEffect } from 'react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apartmentId, setApartmentId] = useState('');
  const [message, setMessage] = useState('');
  const [apartments, setApartments] = useState([]);

  useEffect(() => {
    // Fetch apartments for dropdown or validation purposes
    const fetchApartments = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/apartments`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setApartments(data);
      } catch (error) {
        console.error('Failed to fetch apartments:', error);
      }
    };

    fetchApartments();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Check if the provided apartmentId exists in the Apartments table
      const isValidApartment = apartments.some(apartment => apartment.Id === parseInt(apartmentId, 10));
      if (!isValidApartment) {
        setMessage('Invalid Apartment ID');
        return;
      }

      // Check if the user with the same email and apartmentId already exists
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/check-user?email=${encodeURIComponent(email)}&apartmentId=${encodeURIComponent(apartmentId)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      // If user exists, show error message
      if (data.exists) {
        setMessage('User with this email already exists for this Apartment ID');
        return;
      }

      // Proceed with registration if user does not exist
      const registerResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, apartmentId }),
      });

      if (!registerResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const registerData = await registerResponse.text();
      setMessage(registerData); // Assuming server sends "User registered successfully" or error message

      // Clear the form fields after successful registration
      setName('');
      setEmail('');
      setPassword('');
      setApartmentId('');

    } catch (error) {
      console.error('Failed to fetch:', error);
      setMessage('Failed to register user');
    }
  };

  return (
    <div className="register-block">
      <h2>Register</h2>
      {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select
          value={apartmentId}
          onChange={(e) => setApartmentId(e.target.value)}
          required
        >
          <option value="">Select Apartment ID</option>
          {apartments.map(apartment => (
            <option key={apartment.Id} value={apartment.Id}>{apartment.Name}</option>
          ))}
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;

