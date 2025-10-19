// Script to check the column names in the Shows table
require('dotenv').config();
const db = require('./lib/db');

async function checkShowsColumns() {
  console.log('Checking column names in Shows table...');

  try {
    // Get column information for the Shows table
    const columnsResult = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Shows' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('Columns in Shows table:');
    columnsResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Get a sample record to see the actual data
    const sampleResult = await db.query('SELECT * FROM "Shows" LIMIT 1');
    if (sampleResult.rows.length > 0) {
      console.log('\nSample record:');
      console.log(sampleResult.rows[0]);
    }

  } catch (error) {
    console.error('❌ Error checking Shows table columns:', error.message);
  }
}

checkShowsColumns();
