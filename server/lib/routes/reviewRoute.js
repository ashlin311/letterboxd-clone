import express from 'express';
import db from '../db.js';

const router = express.Router();

// Submit a new review
router.post('/', async (req, res) => {
  try {
    const { movieId, userId, rating, content } = req.body;

    // Validate input
    if (!movieId || !userId || !rating || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Movie ID, User ID, rating, and content are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if user already reviewed this movie (only for new reviews, not updates)
    const existingReview = await db.query(
      'SELECT * FROM "Review" WHERE movie_id = $1 AND user_id = $2',
      [movieId, userId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'You have already reviewed this movie. Use the edit feature to update your review.' 
      });
    }

    // Insert new review
    const result = await db.query(
      'INSERT INTO "Review" (movie_id, user_id, "Rating", review_text, added_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [movieId, userId, rating, content]
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: result.rows[0]
    });

  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Update an existing review
router.put('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, content } = req.body;

    console.log('PUT /reviews/:reviewId called with:', { reviewId, rating, content });

    // Validate input
    if (!rating || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating and content are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Update the review
    const result = await db.query(
      'UPDATE "Review" SET "Rating" = $1, review_text = $2, added_at = NOW() WHERE "Review_id" = $3 RETURNING *',
      [rating, content, reviewId]
    );

    console.log('Update query result:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: result.rows[0]
    });

  } catch (error) {
    console.error('Review update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Delete a review
router.delete('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    console.log('DELETE /reviews/:reviewId called with reviewId:', reviewId);

    // Delete the review
    const result = await db.query(
      'DELETE FROM "Review" WHERE "Review_id" = $1 RETURNING *',
      [reviewId]
    );

    console.log('Delete query result:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Review deletion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export default router;

