// server/test-db.js
// Import the query function from your db setup file
require('dotenv').config();
const db = require('./lib/db');

async function testDatabase() {
  console.log('Attempting to connect to the database and insert data...');

  try {
    // 1. INSERT a new user into the "User" table
    const insertQuery = `
      INSERT INTO "User" ("Name", "Password") 
      VALUES ($1, $2) 
      RETURNING *;
    `;
    const newUser = ['test_user_from_code', 'secure_password_123'];
    
    const insertResult = await db.query(insertQuery, newUser);
    console.log('✅ INSERT successful! New user created:');
    console.log(insertResult.rows[0]);

    // 2. SELECT all users to verify the insert
    const selectQuery = 'SELECT * FROM "User";';
    const selectResult = await db.query(selectQuery);
    console.log('\n✅ SELECT successful! All users in the table:');
    console.table(selectResult.rows);

  } catch (error) {
    console.error('❌ DATABASE TEST FAILED:', error);
  }
}

testDatabase();