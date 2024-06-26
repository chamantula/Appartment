const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3001;
const dotenv = require('dotenv');
dotenv.config(); 
const host = process.env.SERVER_HOST;
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// MSSQL Config
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: 'Apartments', // Replace with your database name
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};


const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}


// Connect to MSSQL
sql.connect(dbConfig)
  .then(() => console.log('Connected to MSSQL'))
  .catch(err => console.error('Failed to connect to MSSQL', err));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});




// Admin login route
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('Username', sql.NVarChar, username)
      .query('SELECT * FROM Admins WHERE Username = @Username');

    if (result.recordset.length === 0) {
      return res.status(400).send('Admin user not found');
    }

    const admin = result.recordset[0];
    const isPasswordValid = await bcrypt.compare(password, admin.Password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid password');
    }

    res.status(200).send('Login successful');
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).send('Failed to login admin');
  }
});
// Route to fetch users for approval
app.get('/users', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM Users WHERE Approved = 0'); // Assuming there's an 'Approved' column
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).send('Failed to fetch users');
  }
});

// Route to approve a user
app.post('/approve-user', async (req, res) => {
  const { userId } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const query = `
      UPDATE Users
      SET Approved = 1
      WHERE Id = @UserId
    `;
    await pool.request()
      .input('UserId', sql.Int, userId)
      .query(query);

    res.status(200).send('User approved');
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).send('Failed to approve user');
  }
});
// Route to add a new apartments
app.post('/apartments', async (req, res) => {
  const { Name, domain } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const query = `
      INSERT INTO Apartments (Name, Domain) 
      VALUES (@Name, @Domain);
      SELECT SCOPE_IDENTITY() AS NewApartmentId;
    `;
    const result = await pool.request()
      .input('Name', sql.NVarChar, Name) // Ensure 'Name' matches with frontend payload
      .input('Domain', sql.NVarChar, domain)
      .query(query);

    const newApartmentId = result.recordset[0].NewApartmentId;

    res.status(201).json({ newApartmentId });
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).send('Failed to add apartment');
  }
});
const upload = multer({ storage: storage });

// Route to handle image upload
app.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    res.status(200).json({ imagePath: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Failed to upload image');
  }
});

// Route to fetch the latest uploaded image (for background)
app.get('/latest-image', async (req, res) => {
  try {
    const files = fs.readdirSync('uploads');
    if (files.length === 0) {
      return res.status(404).json({ message: 'No images found' });
    }
    const latestFile = files
      .map(file => ({
        file,
        time: fs.statSync(path.join('uploads', file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time)[0].file;

    res.json({ imagePath: `/uploads/${latestFile}` });
  } catch (error) {
    console.error('Error fetching latest image:', error);
    res.status(500).send('Failed to fetch latest image');
  }
});


// Route to fetch apartments
app.get('/apartments', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT Id, Name FROM Apartments');
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).send('Failed to fetch apartments');
  }
});
// Route to check if user exists by email and apartmentId
app.get('/check-user', async (req, res) => {
  const { email, apartmentId } = req.query;
  try {
    const pool = await sql.connect(dbConfig);
    const query = `
      SELECT TOP 1 1
      FROM Users
      WHERE Email = @Email AND ApartmentId = @ApartmentId
    `;
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .input('ApartmentId', sql.Int, apartmentId)
      .query(query);

    const userExists = result.recordset.length > 0;
    res.json({ exists: userExists });
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).send('Failed to check user');
  }
});

// Route to register a new user
app.post('/register', async (req, res) => {
  const { name, email, password, apartmentId } = req.body;
  try {
    const pool = await sql.connect(dbConfig);

    // Check if the user already exists before inserting
    const userExistsQuery = `
      SELECT TOP 1 1
      FROM Users
      WHERE Email = @Email AND ApartmentId = @ApartmentId
    `;
    const checkResult = await pool.request()
      .input('Email', sql.NVarChar, email)
      .input('ApartmentId', sql.Int, apartmentId)
      .query(userExistsQuery);

    if (checkResult.recordset.length > 0) {
      res.status(409).send('User with this email already exists for this Apartment ID');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user if not already exists
    const insertUserQuery = `
      INSERT INTO Users (Name, Email, Password, ApartmentId, Approved) 
      VALUES (@Name, @Email, @Password, @ApartmentId, 0)
    `;
    await pool.request()
      .input('Name', sql.NVarChar, name)
      .input('Email', sql.NVarChar, email)
      .input('Password', sql.NVarChar, hashedPassword)
      .input('ApartmentId', sql.Int, apartmentId)
      .query(insertUserQuery);
    
    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).send('Failed to register user');
  }
});

// Route to login user
app.post('/login', async (req, res) => {
  const { email, password, apartmentId } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .input('ApartmentId', sql.Int, apartmentId)
      .query('SELECT * FROM Users WHERE Email = @Email AND ApartmentId = @ApartmentId AND Approved = 1');

    if (result.recordset.length === 0) {
      return res.status(400).send('User not found/user not approved by admin please contact admin');
    }

    const user = result.recordset[0];

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid password');
    }

    res.status(200).send('Login successful');
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send('Failed to login user');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://${host}:${port}`);
});

