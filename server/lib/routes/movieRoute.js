const express = require('express');
const router = express.Router();
const movieController = require('../Controller/movieController');

router.get('/:id', movieController.getMovieById);

module.exports = router;