import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [Name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const approveUser = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/approve-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error('Failed to approve user');
      }
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const addApartment = async () => {
  if (!Name || !domain) {
    alert('Apartment name and domain name are required');
    return;
  }
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/apartments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Name, domain }), // Ensure 'Name' and 'domain' are correct
    });
    if (!response.ok) {
      throw new Error('Failed to add apartment');
    }
    setName(''); // Reset state after successful addition
    setDomain('');
  } catch (error) {
    console.error('Error adding apartment:', error);
  }
};

  const handleImageUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/upload-image`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      const data = await response.json();
      console.log('Image uploaded successfully:', data);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div>
        <h3>Approve Users</h3>
        <ul>
          {users.map(user => (
            <li key={user.Id}>
              {user.Name} - {user.Email}
              <button onClick={() => approveUser(user.Id)}>Approve</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Add Apartment</h3>
        <input
          type="text"
          placeholder="Apartment Name"
          value={Name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Domain Name"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button onClick={addApartment}>Add Apartment</button>
      </div>
      <div>
        <h3>Upload Image</h3>
        <form onSubmit={handleImageUpload}>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
          <button type="submit">Upload</button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;

