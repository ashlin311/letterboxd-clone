const db = require('../db');

exports.getMovieById = async(req, res) => {
    const  movieId = req.params.id;
    console.log(movieId);
    try{
    const result = await db.query('SELECT movie_id, name, language, "Release_Date", "Synopsis", now_showing, runtime, "Poster", "Trailer", "Rating", "Dir_id" FROM "Movie" WHERE movie_id = $1', [movieId]);
        console.log(result.rows);
        if (result.rows.length===0){
            return res.status(404).json({error: "Movie not found"});
        }
        else res.json(result.rows[0]);
    }
    catch(err){
        res.status(500).json({error: "Internal server error"}); 
        console.log(err);
    }
}

// List movies with optional search query q, limit and offset
exports.listMovies = async (req, res) => {
    const q = req.query.q || '';
    const limit = Math.min(parseInt(req.query.limit) || 30, 200);
    const offset = parseInt(req.query.offset) || 0;
    const nowFilter = (req.query.now === 'true' || req.query.now_showing === 'true');
    try {
        // If a search query exists, include it. If nowFilter is present, combine with now_showing = true.
        if (q) {
            const search = `%${q.toLowerCase()}%`;
            if (nowFilter) {
                const result = await db.query(
                    'SELECT movie_id, name, "Poster" AS poster, "Synopsis" AS synopsis FROM "Movie" WHERE now_showing = true AND (LOWER(name) LIKE $1 OR CAST(movie_id AS text) LIKE $2) ORDER BY movie_id LIMIT $3 OFFSET $4',
                    [search, `%${q}%`, limit, offset]
                );
                return res.json({ movies: result.rows, total: result.rowCount });
            }
            const result = await db.query(
                'SELECT movie_id, name, "Poster" AS poster, "Synopsis" AS synopsis FROM "Movie" WHERE LOWER(name) LIKE $1 OR CAST(movie_id AS text) LIKE $2 ORDER BY movie_id LIMIT $3 OFFSET $4',
                [search, `%${q}%`, limit, offset]
            );
            return res.json({ movies: result.rows, total: result.rowCount });
        }

        // No search query — optionally apply now_showing filter.
        if (nowFilter) {
            const result = await db.query('SELECT movie_id, name, "Poster" AS poster, "Synopsis" AS synopsis FROM "Movie" WHERE now_showing = true ORDER BY movie_id LIMIT $1 OFFSET $2', [limit, offset]);
            return res.json({ movies: result.rows, total: result.rowCount });
        }

        const result = await db.query('SELECT movie_id, name, "Poster" AS poster, "Synopsis" AS synopsis FROM "Movie" ORDER BY movie_id LIMIT $1 OFFSET $2', [limit, offset]);
        return res.json({ movies: result.rows, total: result.rowCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

