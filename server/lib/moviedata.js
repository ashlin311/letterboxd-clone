const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const path = require('path');

// Load environment variables from root directory
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Configuration from environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// TMDb API endpoints
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const DISCOVER_ENDPOINT = `${TMDB_BASE_URL}/discover/movie`;
const CREDITS_ENDPOINT = `${TMDB_BASE_URL}/movie`;

// Helper function to make TMDb API requests with retry logic
async function fetchFromTMDb(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limit hit, wait and retry
        const retryAfter = parseInt(error.response.headers['retry-after']) || 1;
        console.log(`Rate limit hit, waiting ${retryAfter} seconds...`);
        await sleep(retryAfter * 1000);
        continue;
      }
      
      if (i === retries - 1) throw error;
      console.log(`Request failed, retrying... (${i + 1}/${retries})`);
      await sleep(1000);
    }
  }
}

// Helper function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to upsert director and return Dir_id
async function upsertDirector(directorName) {
  if (!directorName) return null;
  
  try {
    // First, try to find existing director
    const { data: existingDirector, error: findError } = await supabase  // destructuring assignment, here the database returns an object with data and error properties
      .from('Director')
      .select('Dir_id')
      .eq('Dir_name', directorName) // Select dir_id from Director where Dir_name = directorName
      .single();

    if (existingDirector && !findError) {
      return existingDirector.Dir_id;
    }

    // If not found, insert new director
    const { data: newDirector, error: insertError } = await supabase
      .from('Director')
      .insert({ Dir_name: directorName }) //inserting new director name to the table, the dir_id is generated automatically by the database
      .select('Dir_id')
      .single();

    if (insertError) {
      console.error('Error inserting director:', insertError);
      return null;
    }

    return newDirector.Dir_id;
  } catch (error) {
    console.error('Error in upsertDirector:', error);
    return null;
  }
}

// Function to upsert cast member and return cast_id
async function upsertCastMember(castName, profilePath = null) {
  if (!castName) return null;
  
  try {
    // First, try to find existing cast member
    const { data: existingCast, error: findError } = await supabase
      .from('Cast')
      .select('cast_id')
      .eq('name', castName) // Select cast_id from Cast where name = castName
      .single();

    if (existingCast && !findError) {
      return existingCast.cast_id;
    }

    // If not found, insert new cast member
    const photoUrl = profilePath ? `https://image.tmdb.org/t/p/w500${profilePath}` : null;
    
    const { data: newCast, error: insertError } = await supabase
      .from('Cast')
      .insert({ 
        name: castName,
        photo: photoUrl 
      })
      .select('cast_id')
      .single();

    if (insertError) {
      console.error('Error inserting cast member:', insertError);
      return null;
    }

    return newCast.cast_id;
  } catch (error) {
    console.error('Error in upsertCastMember:', error);
    return null;
  }
}

// Function to get movie credits from TMDb
async function getMovieCredits(movieId) {
  const creditsUrl = `${CREDITS_ENDPOINT}/${movieId}/credits?api_key=${TMDB_API_KEY}`;
  
  try {
    const credits = await fetchFromTMDb(creditsUrl);
    
    // Find director from crew
    const director = credits.crew?.find(member => member.job === 'Director');
    
    // Get cast members (limit to top 10 for performance)
    const cast = credits.cast?.slice(0, 10) || [];
    
    return {
      director: director?.name || null,
      cast: cast.map(member => ({
        name: member.name,
        character: member.character,
        profile_path: member.profile_path
      }))
    };
  } catch (error) {
    console.error(`Error fetching credits for movie ${movieId}:`, error);
    return { director: null, cast: [] };
  }
}

// Function to get movie details (including runtime and trailer)
async function getMovieDetails(movieId) {
  const detailsUrl = `${CREDITS_ENDPOINT}/${movieId}?api_key=${TMDB_API_KEY}`;
  
  try {
    const details = await fetchFromTMDb(detailsUrl);
    
    // Also fetch videos/trailers
    const videosUrl = `${CREDITS_ENDPOINT}/${movieId}/videos?api_key=${TMDB_API_KEY}`;
    const videosData = await fetchFromTMDb(videosUrl);
    
    // Find the first YouTube trailer
    let trailerUrl = null;
    if (videosData.results) {
      const trailer = videosData.results.find(video => 
        video.type === 'Trailer' && 
        video.site === 'YouTube' &&
        video.official === true
      ) || videosData.results.find(video => 
        video.type === 'Trailer' && 
        video.site === 'YouTube'
      );
      
      if (trailer) {
        trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      }
    }
    
    return {
      runtime: details.runtime || null,
      trailer: trailerUrl
    };
  } catch (error) {
    console.error(`Error fetching details for movie ${movieId}:`, error);
    return { runtime: null, trailer: null };
  }
}

// Function to check if movie already exists and insert if not
async function upsertMovie(movieData, directorId) {
  const movieRecord = {
    name: movieData.title,
    language: movieData.original_language,
    Release_Date: movieData.release_date || null,
    Synopsis: movieData.overview || null,
    runtime: movieData.runtime || null,
    Poster: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null,
    Trailer: movieData.trailer || null,
    Rating: movieData.vote_average || null,
    Dir_id: directorId,
    now_showing: false
  };

  try {
    // First, check if movie already exists (by title and release date)
    const { data: existingMovie, error: findError } = await supabase
      .from('Movie')
      .select('movie_id')
      .eq('name', movieData.title)
      .eq('Release_Date', movieData.release_date || null)
      .single();

    if (existingMovie && !findError) {
      console.log(`📋 Movie "${movieData.title}" already exists, skipping...`);
      return existingMovie.movie_id;
    }

    // If not found, insert new movie
    const { data, error } = await supabase
      .from('Movie')
      .insert(movieRecord)
      .select('movie_id')
      .single();

    if (error) {
      console.error('Error inserting movie:', error);
      return null;
    }

    return data.movie_id;
  } catch (error) {
    console.error('Error in upsertMovie:', error);
    return null;
  }
}

// Function to check if movie-cast relationship already exists
async function insertMovieCast(movieId, castIds) {
  if (castIds.length === 0) return;

  try {
    // Get existing relationships for this movie
    const { data: existingRelations } = await supabase
      .from('movie_cast')
      .select('cast_id')
      .eq('movie_id', movieId);

    const existingCastIds = new Set(existingRelations?.map(rel => rel.cast_id) || []);
    
    // Filter out relationships that already exist
    const newCastIds = castIds.filter(castId => !existingCastIds.has(castId));
    
    if (newCastIds.length === 0) {
      console.log(`📋 All cast relationships already exist for movie ${movieId}`);
      return;
    }

    const movieCastRecords = newCastIds.map(castId => ({
      movie_id: movieId,
      cast_id: castId
    }));

    const { error } = await supabase
      .from('movie_cast')
      .insert(movieCastRecords);

    if (error) {
      console.error('Error inserting movie-cast relationships:', error);
    } else {
      console.log(`➕ Added ${newCastIds.length} new cast relationships`);
    }
  } catch (error) {
    console.error('Error in insertMovieCast:', error);
  }
}

// Main function to process a single movie
async function processMovie(movie) {
  try {
    console.log(`Processing: ${movie.title} (${movie.release_date})`);
    
    // Get movie details (including runtime and trailer)
    const details = await getMovieDetails(movie.id);
    movie.runtime = details.runtime;
    movie.trailer = details.trailer;
    
    // Get credits (director and cast)
    const credits = await getMovieCredits(movie.id);
    
    // Upsert director
    const directorId = await upsertDirector(credits.director);
    
    // Insert/update movie
    const movieId = await upsertMovie(movie, directorId);
    if (!movieId) {
      console.error(`Failed to upsert movie: ${movie.title}`);
      return;
    }
    
    // Upsert cast members and collect their IDs
    const castIds = [];
    for (const castMember of credits.cast) {
      const castId = await upsertCastMember(castMember.name, castMember.profile_path);
      if (castId) {
        castIds.push(castId);
      }
    }
    
    // Insert movie-cast relationships
    await insertMovieCast(movieId, castIds);
    
    console.log(`✅ Successfully processed: ${movie.title}`);
    
    // Add small delay to be respectful to APIs
    await sleep(100);
    
  } catch (error) {
    console.error(`Error processing movie ${movie.title}:`, error);
  }
}

// Function to fetch movies from TMDb discover endpoint
async function fetchMoviesFromTMDb(page = 1) {
  const url = `${DISCOVER_ENDPOINT}?api_key=${TMDB_API_KEY}&primary_release_date.gte=2000-01-01&sort_by=popularity.desc&page=${page}&include_adult=false&with_release_type=2|3&with_original_language=en`;
  
  try {
    const data = await fetchFromTMDb(url);
    
    // Filter out movies with invalid or missing release dates
    const validMovies = (data.results || []).filter(movie => {
      const releaseDate = movie.release_date;
      
      // Skip movies without release dates
      if (!releaseDate) {
        console.log(`⚠️  Skipping movie "${movie.title}" - no release date`);
        return false;
      }
      
      // Skip movies with the default date (which indicates missing data)
      if (releaseDate === '2000-01-01') {
        console.log(`⚠️  Skipping movie "${movie.title}" - has default date 2000-01-01`);
        return false;
      }
      
      // Validate the date format and ensure it's actually from 2000+
      const year = parseInt(releaseDate.split('-')[0]);
      if (year < 2000) {
        console.log(`⚠️  Skipping movie "${movie.title}" - release year ${year} is before 2000`);
        return false;
      }
      if (movie.original_language !== 'en') {
        console.log(`⚠️  Skipping movie "${movie.title}" - original language is not English (${movie.original_language})`);
        return false;
      }
      return true;
    });
    
    return {
      movies: validMovies,
      totalPages: data.total_pages || 0,
      currentPage: data.page || 1,
      filteredOut: (data.results || []).length - validMovies.length
    };
  } catch (error) {
    console.error(`Error fetching movies from page ${page}:`, error);
    return { movies: [], totalPages: 0, currentPage: page, filteredOut: 0 };
  }
}

// Main import function
async function importMovies() {
  console.log('🎬 Starting TMDb movie import for movies from 2000+...');
  
  if (!TMDB_API_KEY) {
    console.error('❌ Please set TMDB_API_KEY in your .env file');
    return;
  }
  
  if (!SUPABASE_URL) {
    console.error('❌ Please set SUPABASE_URL in your .env file');
    return;
  }
  
  if (!SUPABASE_ANON_KEY) {
    console.error('❌ Please set SUPABASE_ANON_KEY in your .env file');
    return;
  }
  
  let currentPage = 1;
  let totalMoviesProcessed = 0;
  
  try {
    while (true) {
      console.log(`\n📄 Fetching page ${currentPage}...`);
      
      const { movies, totalPages, filteredOut } = await fetchMoviesFromTMDb(currentPage);
      
      if (movies.length === 0) {
        console.log('No more valid movies found.');
        break;
      }
      
      console.log(`Found ${movies.length} valid movies on page ${currentPage}/${totalPages}${filteredOut > 0 ? ` (filtered out ${filteredOut} invalid movies)` : ''}`);
      
      // Process each movie
      for (const movie of movies) {
        await processMovie(movie);
        totalMoviesProcessed++;
        
        // Progress indicator
        if (totalMoviesProcessed % 10 === 0) {
          console.log(`\n📊 Progress: ${totalMoviesProcessed} movies processed`);
        }
      }
      
      currentPage++;
      
      // Optional: Limit for testing (remove this in production)
      // if (currentPage > 3) break; // Remove this line for full import
      
      // Be respectful to TMDb API
      await sleep(500);
    }
    
    console.log(`\n🎉 Import completed! Total movies processed: ${totalMoviesProcessed}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Function to check database connection
async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('Director')
      .select('Dir_id')
      .limit(1);
      
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

// Run the import
async function main() {
  console.log('🔍 Checking database connection...');
  const isConnected = await checkDatabaseConnection();
  
  if (!isConnected) {
    console.error('❌ Cannot proceed without database connection');
    return;
  }
  
  await importMovies();
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export functions for modular usage
module.exports = {
  importMovies,
  processMovie,
  upsertDirector,
  upsertCastMember,
  upsertMovie,
  getMovieCredits,
  fetchMoviesFromTMDb,
  main
};