// server/db.js
require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'skilllink_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Verify connection on startup
pool.getConnection()
  .then((conn) => {
    console.log('✅ MySQL connected — skilllink_db');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Check your .env DB_* variables and that MySQL is running.');
    process.exit(1);
  });

module.exports = pool;