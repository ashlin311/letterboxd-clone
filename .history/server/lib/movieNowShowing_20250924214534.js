import supabase from './sync.js';

async function updateNowShowingMovies() {
    try {
    const { data, error } = await supabase
    .from('Movie')
    .update({ now_showing: true })
    .gte('Release_Date', '2025-08-01')
    .lte('Release_Date', '2025-09-30')
    .select('movie_id, name, Release_Date');

    if (error) {
      console.error('Error updating movies:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('📭 No movies found for Aug-Sep 2025');
      return;
    }

    console.log(`✅ Updated ${data.length} movies to now_showing = true:`);
    data.forEach(movie => {
      console.log(`   • ${movie.name} (${movie.Release_Date})`);
    });

  } 
  catch (error) {
    console.error('Error:', error);
  }
}

updateNowShowingMovies();