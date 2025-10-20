import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import '../styles/profile.css';

const Profile = () => {
  const { userId: urlUserId } = useParams(); // Get userId from URL if viewing another user's profile
  const [profileData, setProfileData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine if viewing own profile or another user's profile
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnProfile = !urlUserId || urlUserId === String(loggedInUser.id);
  const profileUserId = urlUserId || loggedInUser.id;

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!profileUserId) {
        throw new Error('User not found. Please log in again.');
      }

      const response = await fetch(`http://localhost:3000/profile/${profileUserId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profileUserId]);

  const fetchBookings = useCallback(async () => {
    // Only fetch bookings for own profile
    if (!isOwnProfile) return;
    
    try {
      setBookingsLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id;

      if (!userId) return;

      const response = await fetch(`http://localhost:3000/bookings/user/${userId}/bookings`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  }, [isOwnProfile]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/bookings/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to cancel booking');

      // Refresh bookings list
      fetchBookings();
      alert('Booking cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchBookings();
  }, [fetchProfileData, fetchBookings]);

  const renderStars = useCallback((rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }

    return stars;
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-container">
          <div className="error">
            <h2>Error Loading Profile</h2>
            <p>{error}</p>
            <small>Please try refreshing the page or logging in again.</small>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-container">
          <div className="error">
            <h2>Profile Not Found</h2>
            <p>Unable to load profile data.</p>
          </div>
        </div>
      </div>
    );
  }

  const { user, watchlist = [], reviews = [], average_rating } = profileData || {};

  // Additional safety check
  if (!user) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-container">
          <div className="loading">Loading user data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-container">
        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-card">
              {/* Profile Picture */}
              <div className="profile-picture-section">
                <div className="profile-picture-wrapper">
                  <img 
                    src={user.profile_pic || '/default-avatar.png'} 
                    alt={user.Name}
                    className="profile-picture"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
              </div>

              {/* Name and Join Date */}
              <div className="profile-name-section">
                <h1 className="profile-name">{user.Name}</h1>
                <p className="member-since">
                  Member since {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="profile-bio-section">
                  <h3 className="bio-title">About</h3>
                  <p className="bio-text">{user.bio}</p>
                </div>
              )}

              {/* Average Rating */}
              <div className="rating-card">
                <div className="stars-container">
                  {renderStars(parseFloat(average_rating || 0))}
                </div>
                <div className="rating-number">{average_rating || "0.00"}</div>
                <div className="rating-text">
                  Average Rating ({reviews?.length || 0} reviews)
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-main-content">
            {/* Bookings Section - Only show for own profile */}
            {isOwnProfile && (
            <div className="bookings-section">
              <div className="section-header">
                <h2>
                  My Bookings
                  <span className="item-count">({bookings.length})</span>
                </h2>
              </div>
              
              {bookingsLoading ? (
                <p style={{ color: '#8892b0', textAlign: 'center', padding: '2rem' }}>
                  Loading bookings...
                </p>
              ) : bookings.length > 0 ? (
                <div className="bookings-grid">
                  {bookings.map((booking) => (
                    <div key={booking.booking_id} className="booking-card">
                      <div className="booking-poster-wrapper">
                        <img 
                          src={booking.movie_poster || '/default-movie-poster.jpg'} 
                          alt={booking.movie_name}
                          className="booking-poster"
                          onError={(e) => {
                            e.target.src = '/default-movie-poster.jpg';
                          }}
                        />
                      </div>
                      <div className="booking-details">
                        <h3 className="booking-movie-title">{booking.movie_name}</h3>
                        <p className="booking-seats-info">
                          <span className="booking-label">Seats:</span> 
                          <span className="booking-value">{booking.seats.join(', ')}</span>
                        </p>
                        <p className="booking-total-seats">
                          <span className="booking-label">Total Seats:</span> 
                          <span className="booking-value">{booking.total_seats}</span>
                        </p>
                        <button 
                          onClick={() => handleCancelBooking(booking.booking_id)}
                          className="cancel-booking-btn"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#8892b0', textAlign: 'center', padding: '2rem' }}>
                  No bookings yet. Book your first show!
                </p>
              )}
            </div>

            {/* Watchlist Section */}
            <div className="section">
              <div className="section-header">
                <h2>
                  Watchlist 
                  <span className="item-count">({watchlist.length})</span>
                </h2>
              </div>
              
              {watchlist.length > 0 ? (
                <div className="watchlist-grid">
                  {watchlist.map((item, index) => (
                    <div key={index} className="watchlist-item">
                      <div className="movie-poster-wrapper">
                        <img 
                          src={item.Movie.Poster || '/default-movie-poster.jpg'} 
                          alt={item.Movie.name}
                          className="movie-poster"
                          onError={(e) => {
                            e.target.src = '/default-movie-poster.jpg';
                          }}
                        />
                        <div className="movie-overlay">
                          <span className="movie-title">{item.Movie.name}</span>
                          <span className="movie-year">
                            {item.created_at ? new Date(item.created_at).getFullYear() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#8892b0', textAlign: 'center', padding: '2rem' }}>
                  No movies in watchlist yet.
                </p>
              )}
            </div>

            {/* Reviews Section */}
            <div className="section">
              <div className="section-header">
                <h2>
                  Reviews 
                  <span className="item-count">({reviews.length})</span>
                </h2>
              </div>
              
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <h3 className="review-movie-title">{review.Movie.name}</h3>
                        <div className="review-meta">
                          {review.Rating && (
                            <div className="review-rating">
                              <div className="stars-container">
                                {renderStars(review.Rating)}
                              </div>
                              <span className="rating-fraction">{review.Rating}/5</span>
                            </div>
                          )}
                          <div className="review-date">
                            {new Date(review.added_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {review.review_text && (
                        <p className="review-text">{review.review_text}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#8892b0', textAlign: 'center', padding: '2rem' }}>
                  No reviews yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;