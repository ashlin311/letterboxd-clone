import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Check if movie is in user's watchlist
router.get('/:userId/:movieId', async (req, res) => {
    try {
        const { userId, movieId } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM "Watchlist" WHERE user_id = $1 AND movie_id = $2',
            [userId, movieId]
        );
        
        res.json({
            inWatchlist: result.rows.length > 0
        });
    } catch (error) {
        console.error('Error checking watchlist:', error);
        res.status(500).json({ error: 'Failed to check watchlist' });
    }
});

// Add movie to watchlist
router.post('/', async (req, res) => {
    try {
        const { user_id, movie_id } = req.body;
        
        // Check if already in watchlist
        const existingEntry = await pool.query(
            'SELECT * FROM "Watchlist" WHERE user_id = $1 AND movie_id = $2',
            [user_id, movie_id]
        );
        
        if (existingEntry.rows.length > 0) {
            return res.status(400).json({ error: 'Movie already in watchlist' });
        }
        
        // Add to watchlist
        const result = await pool.query(
            'INSERT INTO "Watchlist" (user_id, movie_id, added_at) VALUES ($1, $2, NOW()) RETURNING *',
            [user_id, movie_id]
        );
        
        res.status(201).json({
            message: 'Movie added to watchlist',
            watchlistEntry: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add movie to watchlist' });
    }
});

// Remove movie from watchlist
router.delete('/:userId/:movieId', async (req, res) => {
    try {
        const { userId, movieId } = req.params;
        
        const result = await pool.query(
            'DELETE FROM "Watchlist" WHERE user_id = $1 AND movie_id = $2 RETURNING *',
            [userId, movieId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Movie not found in watchlist' });
        }
        
        res.json({
            message: 'Movie removed from watchlist',
            removedEntry: result.rows[0]
        });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove movie from watchlist' });
    }
});

// Get user's full watchlist
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await pool.query(`
            SELECT w.*, m.name, m.poster, m.release_date, m.language
            FROM "Watchlist" w
            JOIN "Movie" m ON w.movie_id = m.movie_id
            WHERE w.user_id = $1
            ORDER BY w.added_at DESC
        `, [userId]);
        
        res.json({
            watchlist: result.rows
        });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

export default router;