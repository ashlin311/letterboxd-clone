import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import './seatSelection.css';

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  
  const [showInfo, setShowInfo] = useState(null);
  const [seatsByRow, setSeatsByRow] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  // Get actual logged-in user ID from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.user_id || user.id || 1; // Fallback to 1 if not found

  useEffect(() => {
    fetchSeats();
  }, [showId]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/bookings/shows/${showId}/seats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch seats');
      }
      
      const data = await response.json();
      setShowInfo(data.showInfo);
      setSeatsByRow(data.seatsByRow);
    } catch (err) {
      console.error('Error fetching seats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.is_booked) return; // Can't select booked seats
    
    const seatId = seat.seat_id;
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        // Remove seat if already selected
        return prev.filter(id => id !== seatId);
      } else {
        // Add seat if not selected (max 8 seats)
        if (prev.length >= 8) {
          alert('You can select maximum 8 seats at a time');
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const getSeatClassName = (seat) => {
    let className = 'seat';
    
    if (seat.is_booked) {
      className += ' booked';
    } else if (selectedSeats.includes(seat.seat_id)) {
      className += ' selected';
    } else {
      className += ' available';
    }
    
    if (seat.seat_type === 'premium') {
      className += ' premium';
    }
    
    return className;
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    try {
      setBooking(true);
      const response = await fetch(`http://localhost:3000/bookings/shows/${showId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          selectedSeats
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setConfirmationData(data.booking);
      setBookingComplete(true);
      
    } catch (err) {
      console.error('Error creating booking:', err);
      alert(`Booking failed: ${err.message}`);
      // Refresh seats to show updated availability
      fetchSeats();
      setSelectedSeats([]);
    } finally {
      setBooking(false);
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleBackToShowtimes = () => {
    if (showInfo?.movie_id) {
      navigate(`/movie/${showInfo.movie_id}/showtimes`, { replace: false });
    } else {
      // Fallback: go back in browser history
      navigate(-1);
    }
  };

  const handleNewBooking = () => {
    setBookingComplete(false);
    setConfirmationData(null);
    setSelectedSeats([]);
    fetchSeats(); // Refresh seat availability
  };

  if (loading) {
    return (
      <div className="home-root">
        <Header />
        <div className="seat-selection-page">
          <div className="loading">Loading seats...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-root">
        <Header />
        <div className="seat-selection-page">
          <div className="error">Error: {error}</div>
          <button onClick={handleBackToShowtimes} className="back-button">
            ← Back to Show Times
          </button>
        </div>
      </div>
    );
  }

  if (bookingComplete && confirmationData) {
    return (
      <div className="home-root">
        <Header />
        <div className="seat-selection-page">
          <div className="booking-confirmation">
            <div className="confirmation-card">
              <div className="confirmation-icon">✅</div>
              <h1>Booking Confirmed!</h1>
              <p className="confirmation-message">
                Your tickets have been successfully booked.
              </p>
              
              <div className="booking-details">
                <h3>Booking Details</h3>
                <div className="detail-row">
                  <span className="label">Confirmation Code:</span>
                  <span className="value code">{confirmationData.confirmationCode}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Movie:</span>
                  <span className="value">{confirmationData.show?.movie_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Theatre:</span>
                  <span className="value">{confirmationData.show?.theatre_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Show Time:</span>
                  <span className="value">{formatTime(confirmationData.show?.Time)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Seats:</span>
                  <span className="value">
                    {confirmationData.seats?.map(seat => 
                      `${seat.row_letter}${seat.seat_number}`
                    ).join(', ')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Total Seats:</span>
                  <span className="value">{confirmationData.totalSeats}</span>
                </div>
              </div>
              
              <div className="confirmation-actions">
                <button 
                  onClick={handleNewBooking}
                  className="new-booking-btn"
                >
                  Book Another Show
                </button>
                <button 
                  onClick={handleBackToShowtimes}
                  className="back-button"
                >
                  Back to Show Times
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-root">
      <Header />
      <div className="seat-selection-page">
        <div className="seat-selection-header">
          <button 
            className="back-button"
            onClick={handleBackToShowtimes}
          >
            ← Back to Show Times
          </button>
          
          {showInfo && (
            <div className="show-info">
              <h1>Select Your Seats</h1>
              <div className="show-details">
                <span className="movie-name">{showInfo.movie_name}</span>
                <span className="theatre-info">
                  {showInfo.theatre_name} • {formatTime(showInfo.Time)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="cinema-container">
          <div className="screen">
            <div className="screen-text">SCREEN</div>
          </div>

          <div className="seats-container">
            {Object.entries(seatsByRow)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([rowLetter, seats]) => (
                <div key={rowLetter} className="seat-row">
                  <div className="row-label">{rowLetter}</div>
                  <div className="seats">
                    {seats.map((seat) => (
                      <button
                        key={seat.seat_id}
                        className={getSeatClassName(seat)}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.is_booked}
                        title={seat.is_booked 
                          ? 'This seat is already booked' 
                          : `Row ${seat.row_letter}, Seat ${seat.seat_number} (${seat.seat_type})`
                        }
                      >
                        {seat.seat_number}
                      </button>
                    ))}
                  </div>
                  <div className="row-label">{rowLetter}</div>
                </div>
              ))}
          </div>

          <div className="legend">
            <div className="legend-item">
              <div className="seat available legend-seat"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="seat selected legend-seat"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="seat booked legend-seat"></div>
              <span>Booked</span>
            </div>
            <div className="legend-item">
              <div className="seat premium legend-seat"></div>
              <span>Premium</span>
            </div>
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <div className="booking-summary">
            <div className="summary-content">
              <div className="selected-seats-info">
                <h3>Selected Seats: {selectedSeats.length}</h3>
                <p>
                  {Object.entries(seatsByRow)
                    .flatMap(([, seats]) => seats)
                    .filter(seat => selectedSeats.includes(seat.seat_id))
                    .map(seat => `${seat.row_letter}${seat.seat_number}`)
                    .join(', ')
                  }
                </p>
              </div>
              <button 
                className="book-now-btn"
                onClick={handleBooking}
                disabled={booking}
              >
                {booking ? 'Booking...' : `Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelectionPage;