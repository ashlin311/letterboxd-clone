import express from 'express';
import { listMovies, getMovieById } from '../Controller/movieController.js';

const router = express.Router();

// List movies (optional query q, limit, offset)
router.get('/', listMovies);

// Get single movie by id
router.get('/:id', getMovieById);

export default router;