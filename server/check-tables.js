// Script to check what tables exist in the database
require('dotenv').config();
const db = require('./lib/db');

async function checkTables() {
  console.log('Checking all tables in the database...');

  try {
    // Get all tables
    const tablesResult = await db.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Available tables:');
    tablesResult.rows.forEach(table => {
      console.log(`- ${table.table_name} (schema: ${table.table_schema})`);
    });

    // Check specifically for shows-related tables
    const showsTables = await db.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name ILIKE '%show%' OR table_name ILIKE '%Show%')
      ORDER BY table_name
    `);
    
    console.log('\nShows-related tables:');
    if (showsTables.rows.length > 0) {
      showsTables.rows.forEach(table => {
        console.log(`- ${table.table_name} (schema: ${table.table_schema})`);
      });
    } else {
      console.log('No shows-related tables found');
    }

    // Check if there are any tables with similar names
    const similarTables = await db.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('show', 'Show', 'SHOW', 'showtime', 'Showtime', 'SHOWTIME', 'show_time', 'Show_Time', 'SHOW_TIME')
      ORDER BY table_name
    `);
    
    console.log('\nSimilar table names:');
    if (similarTables.rows.length > 0) {
      similarTables.rows.forEach(table => {
        console.log(`- ${table.table_name} (schema: ${table.table_schema})`);
      });
    } else {
      console.log('No similar table names found');
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
}

checkTables();
