import supabase from '../supabase.js';

async function getNowShowingMovies() {
    const { data, error } = await supabase
    .from('movies')
}