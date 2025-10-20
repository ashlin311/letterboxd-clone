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

export const getShowTimes = async (req, res) => {
    const movieId = req.params.id;
    console.log(`Fetching show times for movie ID: ${movieId}`);
    
    try {
        // First check if the movie exists
        const movieCheck = await db.query('SELECT movie_id, name FROM "Movie" WHERE movie_id = $1', [movieId]);
        if (movieCheck.rows.length === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }
        console.log(`Movie found: ${movieCheck.rows[0].name}`);

        // Check if there are any show times at all - try "Shows" first since we know it works
        let showtimeCount;
        try {
            showtimeCount = await db.query('SELECT COUNT(*) as count FROM "Shows"');
            console.log(`Total show times in database: ${showtimeCount.rows[0].count}`);
        } catch (error) {
            console.log('Table "Shows" not found, trying "shows"...');
            try {
                showtimeCount = await db.query('SELECT COUNT(*) as count FROM shows');
                console.log(`Total show times in database: ${showtimeCount.rows[0].count}`);
            } catch (error2) {
                console.log('Table "shows" not found, trying "show_time"...');
                try {
                    showtimeCount = await db.query('SELECT COUNT(*) as count FROM "show_time"');
                    console.log(`Total show times in database: ${showtimeCount.rows[0].count}`);
                } catch (error3) {
                    console.log('Table "show_time" not found, trying "Showtime"...');
                    showtimeCount = await db.query('SELECT COUNT(*) as count FROM "Showtime"');
                    console.log(`Total show times in database: ${showtimeCount.rows[0].count}`);
                }
            }
        }

        // Check if there are any theatres
        const theatreCount = await db.query('SELECT COUNT(*) as count FROM "Theatre"');
        console.log(`Total theatres in database: ${theatreCount.rows[0].count}`);

        // First, let's check what columns actually exist in the Shows table
        const columnCheck = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Shows' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        console.log('Columns in Shows table:', columnCheck.rows.map(r => r.column_name));

        // Fetch show times for the movie with theatre information - try "Shows" first since we know it works
        let result;
        try {
            // Try with different possible column name variations
            result = await db.query(`
                SELECT 
                    s."Show_id" as show_id,
                    s."show_time",
                    s."show_date",
                    s."Theatre_id" as theatre_id,
                    s."movie_id",
                    t."Name" as theatre_name,
                    d."Name" as district_name
                FROM "Shows" s
                JOIN "Theatre" t ON s."Theatre_id" = t."Theatre_id"
                JOIN "Districts" d ON t."District_id" = d."District_id"
                WHERE s."movie_id" = $1
                ORDER BY s."show_date", s."show_time"
            `, [movieId]);
        } catch (error) {
            console.log('Query with "Shows" failed, trying alternative column names...');
            try {
                // Try with different column name variations
                result = await db.query(`
                    SELECT 
                        s."Show_id" as show_id,
                        s."Time" as show_time,
                        s."Date" as show_date,
                        s."Theatre_id" as theatre_id,
                        s."movie_id",
                        t."Name" as theatre_name,
                        d."Name" as district_name
                    FROM "Shows" s
                    JOIN "Theatre" t ON s."Theatre_id" = t."Theatre_id"
                    JOIN "Districts" d ON t."District_id" = d."District_id"
                    WHERE s."movie_id" = $1
                    ORDER BY s."Date", s."Time"
                `, [movieId]);
            } catch (error2) {
                console.log('Query with "shows" failed, trying "show_time"...');
                try {
                    result = await db.query(`
                        SELECT 
                            s.show_id,
                            s.show_time,
                            s.show_date,
                            s.theatre_id,
                            s.movie_id,
                            t."Name" as theatre_name,
                            d."Name" as district_name
                        FROM "show_time" s
                        JOIN "Theatre" t ON s.theatre_id = t."Theatre_id"
                        JOIN "Districts" d ON t."District_id" = d."District_id"
                        WHERE s.movie_id = $1
                        ORDER BY s.show_date, s.show_time
                    `, [movieId]);
                } catch (error3) {
                    console.log('Query with "show_time" failed, trying "Showtime"...');
                    result = await db.query(`
                        SELECT 
                            s."Show_id" as show_id,
                            s."Time" as show_time,
                            s."Theatre_id" as theatre_id,
                            s."movie_id" as movie_id,
                            t."Name" as theatre_name,
                            d."Name" as district_name
                        FROM "Showtime" s
                        JOIN "Theatre" t ON s."Theatre_id" = t."Theatre_id"
                        JOIN "Districts" d ON t."District_id" = d."District_id"
                        WHERE s."movie_id" = $1
                        ORDER BY s."Time"
                    `, [movieId]);
                }
            }
        }

        console.log(`Found ${result.rows.length} show times for movie ${movieId}`);

        // Group show times by date
        const showTimesByDate = {};
        result.rows.forEach(show => {
            // Handle different column name variations
            const showId = show.show_id || show.Show_id;
            const showTime = show.show_time || show.Time;
            const showDate = show.show_date || show.Date;
            const theatreId = show.theatre_id || show.Theatre_id;
            
            // Use show_date if available, otherwise use show_time
            const dateValue = showDate || showTime;
            const date = new Date(dateValue).toDateString();
            
            if (!showTimesByDate[date]) {
                showTimesByDate[date] = [];
            }
            showTimesByDate[date].push({
                show_id: showId,
                time: showTime,
                date: showDate,
                theatre_id: theatreId,
                theatre_name: show.theatre_name,
                district_name: show.district_name
            });
        });

        res.json({ showTimes: showTimesByDate });
    } catch (err) {
        console.error('Error in getShowTimes:', err);
        res.status(500).json({ error: "Internal server error" });
    }
};






