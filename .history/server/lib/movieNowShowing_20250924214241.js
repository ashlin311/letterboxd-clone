import supabase from '../supabase.js';

async function getNowShowingMovies() {
    const { data, error } = await supabase
    .from('movies')
    .update({ now_showing: true })
    .gte('release_date', '2025-08-01')
    .lte('release_date', '2025-09-31')
    .select('movie_id, name, )
}