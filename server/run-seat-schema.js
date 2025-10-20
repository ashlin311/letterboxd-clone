import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSchema() {
  try {
    console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');
    console.log('Reading seat booking schema...');
    const schemaPath = path.join(__dirname, '..', 'db', 'seat-booking-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing seat booking schema...');
    await db.query(schema);
    
    console.log('✅ Seat booking schema executed successfully!');
    console.log('New tables created:');
    console.log('- seats (seat layout for each theatre)');
    console.log('- bookings (booking sessions)');
    console.log('- booking_seats (junction table for seats and bookings)');
    
  } catch (error) {
    console.error('❌ Error executing schema:', error);
    console.error('Error details:', error.message);
  } finally {
    // Close the database connection
    await db.pool.end();
    process.exit(0);
  }
}

runSchema();