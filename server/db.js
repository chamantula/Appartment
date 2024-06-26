const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Welcome@123',
  server: '192.168.29.161',
  database: 'Apartments', // Replace with your database name
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    enableArithAbort: true
  }
};

sql.connect(config, err => {
  if (err) console.log(err);
  else console.log('Connected to MSSQL');
});

module.exports = sql;

