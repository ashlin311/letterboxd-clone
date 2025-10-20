// Script to check the shows table structure
require('dotenv').config();
const db = require('./lib/db');

async function checkShowsTable() {
  console.log('Checking shows table structure...');

  try {
    // Check if shows table exists and get its structure
    const tableCheck = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'shows' 
      ORDER BY ordinal_position
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ Shows table does not exist');
      return;
    }
    
    console.log('✅ Shows table exists with columns:');
    tableCheck.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });

    // Check if there's any data
    const countResult = await db.query('SELECT COUNT(*) as count FROM shows');
    console.log(`\nTotal records in shows table: ${countResult.rows[0].count}`);

    // Show sample data if exists
    if (parseInt(countResult.rows[0].count) > 0) {
      const sampleData = await db.query('SELECT * FROM shows LIMIT 3');
      console.log('\nSample data:');
      console.table(sampleData.rows);
    }

  } catch (error) {
    console.error('❌ Error checking shows table:', error.message);
  }
}

checkShowsTable();
