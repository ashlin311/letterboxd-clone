// Script to add sample data to the shows table
require('dotenv').config();
const db = require('./lib/db');

async function addSampleShows() {
  console.log('Adding sample data to shows table...');

  try {
    // 1. Check if we have movies
    const moviesResult = await db.query('SELECT movie_id, name FROM "Movie" LIMIT 1');
    if (moviesResult.rows.length === 0) {
      console.log('❌ No movies found. Please import movies first.');
      return;
    }

    const movieId = moviesResult.rows[0].movie_id;
    console.log(`Using movie: ${moviesResult.rows[0].name} (ID: ${movieId})`);

    // 2. Check if we have theatres
    const theatresResult = await db.query('SELECT "Theatre_id", "Name" FROM "Theatre" LIMIT 1');
    if (theatresResult.rows.length === 0) {
      console.log('❌ No theatres found. Creating sample theatre...');
      
      // Create a sample district first
      const districtResult = await db.query('INSERT INTO "Districts" ("Name") VALUES ($1) RETURNING "District_id"', ['Sample District']);
      const districtId = districtResult.rows[0].District_id;
      
      // Create a sample theatre
      await db.query('INSERT INTO "Theatre" ("Name", "District_id") VALUES ($1, $2)', ['Sample Theatre', districtId]);
      
      // Get the theatre ID
      const newTheatreResult = await db.query('SELECT "Theatre_id" FROM "Theatre" WHERE "Name" = $1', ['Sample Theatre']);
      const theatreId = newTheatreResult.rows[0].Theatre_id;
      console.log(`✅ Created sample theatre with ID: ${theatreId}`);
    } else {
      const theatreId = theatresResult.rows[0].Theatre_id;
      console.log(`Using theatre: ${theatresResult.rows[0].Name} (ID: ${theatreId})`);
    }

    // 3. Get theatre ID for the shows
    const theatreResult = await db.query('SELECT "Theatre_id" FROM "Theatre" LIMIT 1');
    const theatreId = theatreResult.rows[0].Theatre_id;

    // 4. Create sample shows for today and tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const sampleShows = [
      {
        movie_id: movieId,
        theatre_id: theatreId,
        show_date: today.toISOString().split('T')[0], // YYYY-MM-DD format
        show_time: '14:00:00' // 2:00 PM
      },
      {
        movie_id: movieId,
        theatre_id: theatreId,
        show_date: today.toISOString().split('T')[0],
        show_time: '19:30:00' // 7:30 PM
      },
      {
        movie_id: movieId,
        theatre_id: theatreId,
        show_date: tomorrow.toISOString().split('T')[0],
        show_time: '12:00:00' // 12:00 PM
      },
      {
        movie_id: movieId,
        theatre_id: theatreId,
        show_date: tomorrow.toISOString().split('T')[0],
        show_time: '16:00:00' // 4:00 PM
      },
      {
        movie_id: movieId,
        theatre_id: theatreId,
        show_date: tomorrow.toISOString().split('T')[0],
        show_time: '20:00:00' // 8:00 PM
      }
    ];

    console.log('Creating sample shows...');
    for (const show of sampleShows) {
      try {
        await db.query(
          'INSERT INTO shows (movie_id, theatre_id, show_date, show_time) VALUES ($1, $2, $3, $4)',
          [show.movie_id, show.theatre_id, show.show_date, show.show_time]
        );
        console.log(`✅ Added show: ${show.show_date} at ${show.show_time}`);
      } catch (error) {
        console.log(`⚠️  Show already exists or error: ${error.message}`);
      }
    }

    // 5. Verify the data
    const countResult = await db.query('SELECT COUNT(*) as count FROM shows');
    console.log(`\n✅ Total shows in database: ${countResult.rows[0].count}`);

    // Show sample data
    const sampleData = await db.query('SELECT * FROM shows LIMIT 3');
    console.log('\nSample shows data:');
    console.table(sampleData.rows);

  } catch (error) {
    console.error('❌ Error adding sample shows:', error);
  }
}

addSampleShows();
