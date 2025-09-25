const express = require('express');
const router = express.Router();
const movieController = require('../Controller/movieController');

// List movies (optional query q, limit, offset)
router.get('/', movieController.listMovies);

// Get single movie by id
router.get('/:id', movieController.getMovieById);

module.exports = router;