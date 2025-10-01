import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import '../styles/profile.css';

const Profile = ({ onNavigate }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile data
      const profileResponse = await fetch('http://localhost:3000/profile');
      
      if (!profileResponse.ok) {
        throw new Error(`Failed to fetch profile data: ${profileResponse.status}`);
      }
      const profileData = await profileResponse.json();
      setUserProfile(profileData);

      // Fetch watchlist data
      const watchlistResponse = await fetch('http://localhost:3000/profile/watchlist');
      
      if (!watchlistResponse.ok) {
        throw new Error(`Failed to fetch watchlist data: ${watchlistResponse.status}`);
      }
      const watchlistData = await watchlistResponse.json();
      setWatchlist(watchlistData.movies || []);

      // Fetch recent reviews
      const reviewsResponse = await fetch('http://localhost:3000/profile/reviews');
      
      if (!reviewsResponse.ok) {
        throw new Error(`Failed to fetch reviews data: ${reviewsResponse.status}`);
      }
      const reviewsData = await reviewsResponse.json();
      setRecentReviews(reviewsData.reviews || []);

    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
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
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Header onNavigate={onNavigate} />
        <div className="profile-container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <Header onNavigate={onNavigate} />
        <div className="profile-container">
          <div className="error">
            <h2>Profile Not Found</h2>
            <p>Unable to load profile data. Please check if the user exists or try again later.</p>
            <small>Error: {error}</small>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="profile-page">
        <Header onNavigate={onNavigate} />
        <div className="profile-container">
          <div className="error">
            <h2>Profile Not Found</h2>
            <p>No profile data available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header onNavigate={onNavigate} />
      <div className="profile-container">
        <div className="profile-layout">
          {/* Profile Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-card">
              {/* Profile Picture */}
              <div className="profile-picture-section">
                <div className="profile-picture-wrapper">
                  <img
                    src={userProfile?.avatar || "/api/placeholder/120/120"}
                    alt={userProfile?.name || "Profile"}
                    className="profile-picture"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="profile-name-section">
                <h1 className="profile-name">{userProfile?.name || "User"}</h1>
                <p className="member-since">
                  Member since {userProfile?.memberSince || "Unknown"}
                </p>
              </div>

              {/* Bio */}
              <div className="profile-bio-section">
                <h3 className="bio-title">About</h3>
                <p className="bio-text">
                  {userProfile?.about || "No bio available."}
                </p>
              </div>

              {/* Average Rating */}
              <div className="rating-card">
                <div className="stars-container">
                  {renderStars(userProfile?.averageRating || 0)}
                </div>
                <div className="rating-number">{userProfile?.averageRating || 0}</div>
                <div className="rating-text">
                  Average Rating ({userProfile?.totalReviews || 0} reviews)
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-main-content">
            {/* My Watchlist Section */}
            <div className="section">
              <div className="section-header">
                <h2>📋 My Watchlist <span className="item-count">({watchlist.length} items)</span></h2>
              </div>
              <div className="watchlist-grid">
                {watchlist.map((movie) => (
                  <div key={movie.id} className="watchlist-item">
                    <div className="movie-poster-wrapper">
                      <img src={movie.poster || '/api/placeholder/150/225'} alt={movie.title} className="movie-poster" />
                      <div className="movie-overlay">
                        <span className="movie-title">{movie.title}</span>
                        <span className="movie-year">{movie.year}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews Section */}
            <div className="section">
              <div className="section-header">
                <h2>👁️ Recent Reviews</h2>
              </div>
              <div className="reviews-list">
                {recentReviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <h4 className="review-movie-title">{review.movie}</h4>
                      <div className="review-meta">
                        <div className="review-rating">
                          {renderStars(review.rating)}
                          <span className="rating-fraction">{review.rating}/5</span>
                        </div>
                        <span className="review-date">📅 {review.date}</span>
                      </div>
                    </div>
                    <p className="review-text">{review.review}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;