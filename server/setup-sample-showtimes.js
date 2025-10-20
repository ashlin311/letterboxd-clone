// Simple script to set up minimal sample data for show times testing
// Run this only if you want to test the show times feature
require('dotenv').config();
const db = require('./lib/db');

async function setupSampleShowtimes() {
  console.log('Setting up sample show times data...');

  try {
    // 1. Check if we have movies
    const moviesResult = await db.query('SELECT movie_id, name FROM "Movie" LIMIT 1');
    if (moviesResult.rows.length === 0) {
      console.log('❌ No movies found. Please import movies first.');
      return;
    }

    const movieId = moviesResult.rows[0].movie_id;
    console.log(`Using movie: ${moviesResult.rows[0].name} (ID: ${movieId})`);

    // 2. Check if we have districts and theatres
    const districtsResult = await db.query('SELECT COUNT(*) as count FROM "Districts"');
    const theatresResult = await db.query('SELECT COUNT(*) as count FROM "Theatre"');
    
    console.log(`Districts: ${districtsResult.rows[0].count}, Theatres: ${theatresResult.rows[0].count}`);

    // 3. If no districts, create one
    if (parseInt(districtsResult.rows[0].count) === 0) {
      console.log('Creating sample district...');
      await db.query('INSERT INTO "Districts" ("Name") VALUES ($1)', ['Sample District']);
    }

    // 4. If no theatres, create one
    if (parseInt(theatresResult.rows[0].count) === 0) {
      console.log('Creating sample theatre...');
      const districtId = await db.query('SELECT "District_id" FROM "Districts" LIMIT 1');
      await db.query('INSERT INTO "Theatre" ("Name", "District_id") VALUES ($1, $2)', 
        ['Sample Theatre', districtId.rows[0].District_id]);
    }

    // 5. Create a few sample show times for today and tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const theatreId = await db.query('SELECT "Theatre_id" FROM "Theatre" LIMIT 1');
    
    const showTimes = [
      { date: today, hour: 14, minute: 0 },    // 2:00 PM today
      { date: today, hour: 19, minute: 30 },   // 7:30 PM today
      { date: tomorrow, hour: 12, minute: 0 }, // 12:00 PM tomorrow
      { date: tomorrow, hour: 16, minute: 0 }, // 4:00 PM tomorrow
      { date: tomorrow, hour: 20, minute: 0 }  // 8:00 PM tomorrow
    ];

    console.log('Creating sample show times...');
    for (const showTime of showTimes) {
      const time = new Date(showTime.date);
      time.setHours(showTime.hour, showTime.minute, 0, 0);
      
      await db.query(
        'INSERT INTO "shows" ("movie_id", "theatre_id", "show_time") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [movieId, theatreId.rows[0].Theatre_id, time]
      );
    }

    console.log('✅ Sample show times created successfully!');
    console.log('You can now test the show times feature.');

  } catch (error) {
    console.error('❌ Error setting up sample data:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  setupSampleShowtimes();
}

module.exports = { setupSampleShowtimes };
