import React from 'react';
import '../styles/profile.css';

const Profile = () => {
  // Sample data - in a real app this would come from props or API
  const userProfile = {
    name: "Sarah Johnson",
    memberSince: "January 2024",
    about: "Enthusiast and avid reviewer. Love exploring different genres and discovering hidden gems in cinema.",
    averageRating: 4.3,
    totalReviews: 13,
    avatar: "/api/placeholder/120/120" // placeholder avatar
  };

  const watchlist = [
    { id: 1, title: "Dune: Part Two", year: "2024", poster: "/api/placeholder/150/225" },
    { id: 2, title: "Oppenheimer", year: "2023", poster: "/api/placeholder/150/225" },
    { id: 3, title: "The Batman", year: "2022", poster: "/api/placeholder/150/225" },
    { id: 4, title: "Everything Everywhere All at Once", year: "2022", poster: "/api/placeholder/150/225" },
    { id: 5, title: "Top Gun: Maverick", year: "2022", poster: "/api/placeholder/150/225" }
  ];

  const recentReviews = [
    {
      id: 1,
      movie: "Dune: Part Two",
      rating: 5,
      date: "Mar 15, 2024",
      review: "An absolutely stunning continuation of the epic. Villeneuve masterfully balances spectacle with intimate character moments. The cinematography is breathtaking and the performances are top-notch."
    },
    {
      id: 2,
      movie: "Oppenheimer",
      rating: 4,
      date: "Feb 20, 2024",
      review: "A masterclass in biographical filmmaking. Nolan's direction combined with Murphy's incredible performance creates a haunting portrait of one of history's most complex figures."
    }
  ];

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

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              <img src={userProfile.avatar} alt={userProfile.name} />
            </div>
            <div className="profile-details">
              <h1 className="profile-name">{userProfile.name}</h1>
              <p className="member-since">Member since {userProfile.memberSince}</p>
              
              <div className="about-section">
                <h3>About</h3>
                <p>{userProfile.about}</p>
              </div>

              <div className="rating-section">
                <div className="stars">
                  {renderStars(userProfile.averageRating)}
                </div>
                <div className="rating-info">
                  <span className="rating-number">{userProfile.averageRating}</span>
                  <span className="rating-text">Average Rating ({userProfile.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Watchlist Section */}
        <div className="section">
          <div className="section-header">
            <h2>📋 My Watchlist <span className="item-count">({watchlist.length} items)</span></h2>
          </div>
          <div className="watchlist-grid">
            {watchlist.map((movie) => (
              <div key={movie.id} className="watchlist-item">
                <div className="movie-poster-wrapper">
                  <img src={movie.poster} alt={movie.title} className="movie-poster" />
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
  );
};

export default Profile;