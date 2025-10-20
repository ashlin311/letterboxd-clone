import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './movieDetails.css';

function MovieDetails({ movieId }) {
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [showEditReview, setShowEditReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    content: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  React.useLayoutEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`http://localhost:3000/movies/${movieId}`);
        const data = await res.json();
        setMovie(data);
        
        // Check if current user has already reviewed this movie
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id && data.reviews) {
          const existingReview = data.reviews.find(review => review.user_id === user.id);
          setUserReview(existingReview || null);
        }

        // Check if movie is in user's watchlist
        if (user.id) {
          const watchlistRes = await fetch(`http://localhost:3000/watchlist/${user.id}/${movieId}`);
          if (watchlistRes.ok) {
            const watchlistData = await watchlistRes.json();
            setIsInWatchlist(watchlistData.inWatchlist);
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setMovie(null);
      }
    }
    fetchMovie();
  }, [movieId]);

  const handleAddToWatchlist = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('Please log in to add movies to your watchlist');
      return;
    }

    setWatchlistLoading(true);
    try {
      const response = await fetch('http://localhost:3000/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          movie_id: movieId
        }),
      });

      if (response.ok) {
        setIsInWatchlist(true);
        alert('Movie added to watchlist!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add movie to watchlist');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add movie to watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      return;
    }

    setWatchlistLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/watchlist/${user.id}/${movieId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsInWatchlist(false);
        alert('Movie removed from watchlist!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to remove movie from watchlist');
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      alert('Failed to remove movie from watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleAddReview = () => {
    setShowAddReview(true);
  };

  const handleEditReview = () => {
    // Pre-populate form with existing review data
    setNewReview({
      rating: userReview.Rating || userReview.rating,
      content: userReview.review_text || userReview.content
    });
    setShowEditReview(true);
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/reviews/${userReview.Review_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh movie data to remove deleted review
        const res = await fetch(`http://localhost:3000/movies/${movieId}`);
        const data = await res.json();
        setMovie(data);
        setUserReview(null);
        alert('Review deleted successfully!');
      } else {
        alert('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const handleCancelReview = () => {
    setShowAddReview(false);
    setShowEditReview(false);
    setNewReview({ rating: 0, content: '' });
  };

  const handleBookTickets = () => {
    if (movie && movie.now_showing) {
      // Navigate to show times page
      navigate(`/movie/${movieId}/showtimes`);
    }
  };

  const handleRatingClick = (rating) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleReviewChange = (e) => {
    setNewReview(prev => ({ ...prev, content: e.target.value }));
  };

  const handleSubmitReview = async () => {
    if (newReview.rating === 0 || !newReview.content.trim()) {
      alert('Please provide both a rating and review text');
      return;
    }

    setSubmittingReview(true);
    
    try {
      // Get user info from localStorage (set during login)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const isEditing = showEditReview && userReview;
      const url = isEditing 
        ? `http://localhost:3000/reviews/${userReview.Review_id}`
        : `http://localhost:3000/reviews`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movieId,
          userId: user.id,
          rating: newReview.rating,
          content: newReview.content
        }),
      });

      if (response.ok) {
        // Refresh movie data to show updated review
        const res = await fetch(`http://localhost:3000/movies/${movieId}`);
        const data = await res.json();
        setMovie(data);
        
        // Update userReview state
        const updatedUserReview = data.reviews.find(review => review.user_id === user.id);
        setUserReview(updatedUserReview || null);
        
        setShowAddReview(false);
        setShowEditReview(false);
        setNewReview({ rating: 0, content: '' });
        alert(isEditing ? 'Review updated successfully!' : 'Review added successfully!');
      } else {
        alert(isEditing ? 'Failed to update review' : 'Failed to add review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(isEditing ? 'Failed to update review' : 'Failed to add review');
    } finally {
      setSubmittingReview(false);
    }
  };
  
  if (!movie) return <div>Movie Not Found...</div>;

return (
  <>
    <div className="movie-details-container">
      <div className="movie-header">
        <img
          src={movie.Poster || 'https://placehold.co/300x450?text=NO\nIMAGE'}
          alt={movie.name}
          className="movie-poster"
        />
        <div className="movie-info">
          <h1>{movie.name}</h1>
          <p><strong>Language:</strong> {movie.language}</p>
          <p><strong>Release Date:</strong> {movie.Release_Date.split("T")[0]}</p>
          <p><strong>Synopsis:</strong> {movie.Synopsis}</p>
          
          <div className="watchlist-section">
            {isInWatchlist ? (
              <button 
                className="watchlist-btn remove-watchlist" 
                onClick={handleRemoveFromWatchlist}
                disabled={watchlistLoading}
              >
                {watchlistLoading ? 'Removing...' : '✓ In Watchlist'}
              </button>
            ) : (
              <button 
                className="watchlist-btn add-watchlist" 
                onClick={handleAddToWatchlist}
                disabled={watchlistLoading}
              >
                {watchlistLoading ? 'Adding...' : '+ Add to Watchlist'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    
    <div className="reviews-container">
      <div className="reviews-header">
        <h1>Reviews</h1>
        {!showAddReview && !showEditReview && (
          <div className="review-actions">
            {userReview ? (
              <>
                <button className="edit-review-btn" onClick={handleEditReview}>
                  Edit Review
                </button>
                <button className="delete-review-btn" onClick={handleDeleteReview}>
                  Delete Review
                </button>
              </>
            ) : (
              <button className="add-review-btn" onClick={handleAddReview}>
                Add Review
              </button>
            )}
          </div>
        )}
      </div>

      {(showAddReview || showEditReview) && (
        <div className="add-review-form">
          <h3>{showEditReview ? 'Edit Your Review' : 'Add Your Review'}</h3>
          
          <div className="rating-section">
            <label>Rating:</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${newReview.rating >= star ? 'filled' : ''}`}
                  onClick={() => handleRatingClick(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="review-text-section">
            <label htmlFor="review-text">Your Review:</label>
            <textarea
              id="review-text"
              className="review-textarea"
              placeholder="Write your review here..."
              value={newReview.content}
              onChange={handleReviewChange}
              rows={4}
              maxLength={500}
            />
            <div className="char-count">{newReview.content.length}/500</div>
          </div>

          <div className="review-form-buttons">
            <button 
              className="cancel-btn" 
              onClick={handleCancelReview}
              disabled={submittingReview}
            >
              Cancel
            </button>
            <button 
              className="submit-btn" 
              onClick={handleSubmitReview}
              disabled={submittingReview || newReview.rating === 0 || !newReview.content.trim()}
            >
              {submittingReview ? 
                (showEditReview ? 'Updating...' : 'Submitting...') : 
                (showEditReview ? 'Update Review' : 'Submit Review')
              }
            </button>
          </div>
        </div>
      )}

      {movie.reviews && movie.reviews.length > 0 ? (
        movie.reviews.map((review, idx) => (
          <div key={idx} className="review">
            <div className="review-header">
              <div className="reviewer-info">
                <Link 
                  to={`/user/${review.user_id}`} 
                  className="reviewer-name-link"
                  title={`View ${review.Name || "Anonymous"}'s profile`}
                >
                  <strong className="reviewer-name">{review.Name || "Anonymous"}</strong>
                </Link>
                <div className="review-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`review-star ${(review.Rating || review.rating) >= star ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="rating-number">({review.Rating || review.rating}/5)</span>
                </div>
              </div>
              {review.added_at && (
                <div className="review-date">
                  {new Date(review.added_at).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="review-content">
              {review.review_text || review.content}
            </div>
          </div>
        ))
      ) : (
        !showAddReview && <p>No reviews yet.</p>
      )}
    </div>

    {/* Book Tickets Section */}
    <div className="book-tickets-section">
      <button 
        className={`book-tickets-btn ${movie && movie.now_showing ? 'available' : 'unavailable'}`}
        onClick={handleBookTickets}
        disabled={!movie || !movie.now_showing}
      >
        {movie && movie.now_showing ? 'Book Tickets' : 'Not Currently Showing'}
      </button>
      {movie && !movie.now_showing && (
        <p className="not-showing-text">This movie is not currently showing in theaters</p>
      )}
    </div>
    
  </>
);
}

export default MovieDetails;