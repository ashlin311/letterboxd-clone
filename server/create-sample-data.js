// Script to create sample data for testing show times
require('dotenv').config();
const db = require('./lib/db');

async function createSampleData() {
  console.log('Creating sample data for show times...');

  try {
    // 1. First, let's check what movies we have
    const moviesResult = await db.query('SELECT movie_id, name FROM "Movie" LIMIT 5');
    console.log('Available movies:', moviesResult.rows.length);
    
    if (moviesResult.rows.length === 0) {
      console.log('No movies found. Please run the movie import first.');
      return;
    }

    // 2. Create sample districts
    const districts = [
      { name: 'Downtown' },
      { name: 'Uptown' },
      { name: 'Midtown' },
      { name: 'Westside' },
      { name: 'Eastside' }
    ];

    console.log('Creating districts...');
    for (const district of districts) {
      await db.query('INSERT INTO "Districts" ("Name") VALUES ($1) ON CONFLICT DO NOTHING', [district.name]);
    }

    // 3. Create sample theatres
    const theatres = [
      { name: 'Cineplex Downtown', district: 'Downtown' },
      { name: 'AMC Uptown', district: 'Uptown' },
      { name: 'Regal Midtown', district: 'Midtown' },
      { name: 'Cinemark Westside', district: 'Westside' },
      { name: 'Marcus Eastside', district: 'Eastside' },
      { name: 'IMAX Downtown', district: 'Downtown' },
      { name: 'Theatre 7 Uptown', district: 'Uptown' }
    ];

    console.log('Creating theatres...');
    const theatreIds = [];
    for (const theatre of theatres) {
      const districtResult = await db.query('SELECT "District_id" FROM "Districts" WHERE "Name" = $1', [theatre.district]);
      if (districtResult.rows.length > 0) {
        const theatreResult = await db.query(
          'INSERT INTO "Theatre" ("Name", "District_id") VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING "Theatre_id"',
          [theatre.name, districtResult.rows[0].District_id]
        );
        if (theatreResult.rows.length > 0) {
          theatreIds.push(theatreResult.rows[0].Theatre_id);
        }
      }
    }

    // 4. Create sample show times for the next 7 days
    console.log('Creating show times...');
    const showTimes = [];
    const now = new Date();
    
    // Generate show times for the next 7 days
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(now);
      currentDate.setDate(now.getDate() + day);
      currentDate.setHours(0, 0, 0, 0);
      
      // Show times: 10:00, 13:00, 16:00, 19:00, 22:00
      const timeSlots = [10, 13, 16, 19, 22];
      
      for (const movie of moviesResult.rows) {
        for (const theatreId of theatreIds) {
          for (const hour of timeSlots) {
            const showTime = new Date(currentDate);
            showTime.setHours(hour, 0, 0, 0);
            
            showTimes.push({
              movie_id: movie.movie_id,
              theatre_id: theatreId,
              time: showTime
            });
          }
        }
      }
    }

    // Insert show times
    for (const showTime of showTimes) {
      await db.query(
        'INSERT INTO "shows" ("movie_id", "theatre_id", "show_time") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [showTime.movie_id, showTime.theatre_id, showTime.time]
      );
    }

    console.log(`✅ Created ${showTimes.length} show times across ${theatreIds.length} theatres for ${moviesResult.rows.length} movies`);

    // 5. Verify the data
    const showtimeCount = await db.query('SELECT COUNT(*) as count FROM "shows"');
    console.log(`Total show times in database: ${showtimeCount.rows[0].count}`);

    // 6. Test the API query
    if (moviesResult.rows.length > 0) {
      const testMovieId = moviesResult.rows[0].movie_id;
      console.log(`\nTesting API query for movie ID: ${testMovieId}`);
      
      const apiResult = await db.query(`
        SELECT 
          s."show_id",
          s."show_time",
          s."theatre_id",
          s."movie_id",
          t."Name" as theatre_name,
          d."Name" as district_name
        FROM "shows" s
        JOIN "Theatre" t ON s."theatre_id" = t."Theatre_id"
        JOIN "Districts" d ON t."District_id" = d."District_id"
        WHERE s."movie_id" = $1
        ORDER BY s."show_time"
        LIMIT 5
      `, [testMovieId]);
      
      console.log(`Found ${apiResult.rows.length} show times for test movie`);
      if (apiResult.rows.length > 0) {
        console.log('Sample show time:', apiResult.rows[0]);
      }
    }

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

createSampleData();
