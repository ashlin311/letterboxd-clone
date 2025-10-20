// Test script to check Showtime table and API
require('dotenv').config();
const db = require('./lib/db');

async function testShowtimes() {
  console.log('Testing Showtime table and API...');

  try {
    // 1. Check if Showtime table exists and has data
    const showtimeQuery = 'SELECT * FROM "Showtime" LIMIT 5;';
    const showtimeResult = await db.query(showtimeQuery);
    console.log('✅ Showtime table query successful!');
    console.log('Showtime records found:', showtimeResult.rows.length);
    console.table(showtimeResult.rows);

    // 2. Check if there are any movies
    const movieQuery = 'SELECT movie_id, name FROM "Movie" LIMIT 5;';
    const movieResult = await db.query(movieQuery);
    console.log('\n✅ Movie table query successful!');
    console.log('Movies found:', movieResult.rows.length);
    console.table(movieResult.rows);

    // 3. Check if there are any theatres
    const theatreQuery = 'SELECT "Theatre_id", "Name" FROM "Theatre" LIMIT 5;';
    const theatreResult = await db.query(theatreQuery);
    console.log('\n✅ Theatre table query successful!');
    console.log('Theatres found:', theatreResult.rows.length);
    console.table(theatreResult.rows);

    // 4. Test the exact query used in the API
    if (movieResult.rows.length > 0) {
      const movieId = movieResult.rows[0].movie_id;
      console.log(`\n🔍 Testing showtimes query for movie ID: ${movieId}`);
      
      const apiQuery = `
        SELECT 
          s."Show_id",
          s."Time",
          s."Theatre_id",
          s."movie_id",
          t."Name" as theatre_name,
          d."Name" as district_name
        FROM "Showtime" s
        JOIN "Theatre" t ON s."Theatre_id" = t."Theatre_id"
        JOIN "Districts" d ON t."District_id" = d."District_id"
        WHERE s."movie_id" = $1
        ORDER BY s."Time"
      `;
      
      const apiResult = await db.query(apiQuery, [movieId]);
      console.log('API query result:', apiResult.rows.length, 'records');
      console.table(apiResult.rows);
    }

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  }
}

testShowtimes();
