import supabase from './sync.js';

async function deleteMoviesWithoutPoster() {
  try {
    console.log('🔍 Finding movies without posters...');
    
    // Get all movies without posters
    const { data: movies, error } = await supabase
      .from('Movie')
      .select('movie_id, name')
      .is('Poster', null);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`Found ${movies.length} movies without posters`);

    if (movies.length === 0) {
      console.log('✅ All movies have posters!');
      return;
    }

    const movieIds = movies.map(movie => movie.movie_id);

    // Delete movie-cast relationships first
    console.log('🗑️ Removing movie-cast relationships...');
    await supabase
      .from('movie_cast')
      .delete()
      .in('movie_id', movieIds);

    // Delete the movies
    console.log('🗑️ Removing movies...');
    const { error: deleteError } = await supabase
      .from('Movie')
      .delete()
      .in('movie_id', movieIds);

    if (deleteError) {
      console.error('Error deleting movies:', deleteError);
      return;
    }

    console.log(`✅ Successfully deleted ${movies.length} movies without posters!`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
deleteMoviesWithoutPoster();



