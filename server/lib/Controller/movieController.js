import db from '../db.js';

export const getMovieById = async (req, res) => {
    const movieId = req.params.id;
    try {
        // Fetch movie details
        const movieResult = await db.query('SELECT * FROM "Movie" WHERE movie_id = $1', [movieId]);
        if (movieResult.rows.length === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }
        const movie = movieResult.rows[0];

        // Fetch reviews for the movie with explicit column selection
        const reviewsResult = await db.query(
            'SELECT "Review"."Review_id", "Review"."Rating", "Review".user_id, "Review".movie_id, "Review".review_text, "Review".added_at, "User"."Name" FROM "Review" JOIN "User" ON "Review".user_id = "User".user_id WHERE movie_id = $1', 
            [movieId]
        );
        const reviews = reviewsResult.rows;

        // Send both movie and reviews
        res.json({ ...movie, reviews });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
        console.log(err);
    }
};

// List movies with optional search query q, limit and offset
export const listMovies = async (req, res) => {
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






