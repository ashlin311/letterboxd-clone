import express from 'express';
import { listMovies, getMovieById, getShowTimes } from '../Controller/movieController.js';

const router = express.Router();

// List movies (optional query q, limit, offset)
router.get('/', listMovies);

// Get single movie by id
router.get('/:id', getMovieById);

// Get show times for a movie
router.get('/:id/showtimes', getShowTimes);

export default router;