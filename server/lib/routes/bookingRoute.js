import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get available seats for a specific show (using existing schema)
router.get('/shows/:showId/seats', async (req, res) => {
    try {
        const { showId } = req.params;
        
        // First, get the theatre for this show
        const showQuery = `
            SELECT s."Theatre_id", s."show_time" as "Time", s."movie_id", m."name" as movie_name, t."Name" as theatre_name
            FROM "Shows" s
            JOIN "Theatre" t ON s."Theatre_id" = t."Theatre_id"
            JOIN "Movie" m ON s."movie_id" = m."movie_id"
            WHERE s."Show_id" = $1
        `;
        
        const showResult = await db.query(showQuery, [showId]);
        
        if (showResult.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }
        
        const showInfo = showResult.rows[0];
        
        // Create a simple seat layout (10 rows, 15 seats each) using existing Seat_no table
        // For demonstration, we'll generate seats dynamically
        const seatsByRow = {};
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const seatsPerRow = 15;
        
        // Get already booked seats for this show
        const bookedSeatsQuery = `
            SELECT b."Seat_no"
            FROM "Booked" b
            JOIN "Shows" s ON b."movie_id" = s."movie_id"
            WHERE s."Show_id" = $1
        `;
        const bookedSeatsResult = await db.query(bookedSeatsQuery, [showId]);
        const bookedSeatIds = bookedSeatsResult.rows.map(row => row.Seat_no);
        
        let seatCounter = 1;
        let totalSeats = 0;
        let bookedCount = 0;
        
        for (const row of rows) {
            seatsByRow[row] = [];
            for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
                const seatId = seatCounter++;
                const isBooked = bookedSeatIds.includes(seatId);
                
                seatsByRow[row].push({
                    seat_id: seatId,
                    row_letter: row,
                    seat_number: seatNum,
                    seat_type: row <= 'C' ? 'premium' : 'regular',
                    is_active: true,
                    is_booked: isBooked
                });
                
                totalSeats++;
                if (isBooked) bookedCount++;
            }
        }
        
        res.json({
            showInfo,
            seatsByRow,
            totalSeats,
            availableSeats: totalSeats - bookedCount,
            bookedSeats: bookedCount
        });
        
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({ error: 'Failed to fetch seats' });
    }
});

// Create a new booking with selected seats (using existing schema)
router.post('/shows/:showId/book', async (req, res) => {
    console.log('Booking request received:', { showId: req.params.showId, body: req.body });
    
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { showId } = req.params;
        const { userId, selectedSeats } = req.body; // selectedSeats is array of seat_ids
        
        console.log('Processing booking for:', { showId, userId, selectedSeats });
        
        if (!userId || !selectedSeats || selectedSeats.length === 0) {
            return res.status(400).json({ error: 'User ID and selected seats are required' });
        }
        
        // Get show details
        const showQuery = `
            SELECT s."movie_id", s."show_time" as "Time", m."name" as movie_name, t."Name" as theatre_name
            FROM "Shows" s
            JOIN "Movie" m ON s."movie_id" = m."movie_id"
            JOIN "Theatre" t ON s."Theatre_id" = t."Theatre_id"
            WHERE s."Show_id" = $1
        `;
        const showResult = await client.query(showQuery, [showId]);
        
        if (showResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Show not found' });
        }
        
        const showData = showResult.rows[0];
        
        // Check if any of the selected seats are already booked for this movie
        const checkSeatsQuery = `
            SELECT b."Seat_no"
            FROM "Booked" b
            JOIN "Shows" s ON b."movie_id" = s."movie_id"
            WHERE s."Show_id" = $1 AND b."Seat_no" = ANY($2::int[])
        `;
        
        const bookedSeatsResult = await client.query(checkSeatsQuery, [showId, selectedSeats]);
        
        if (bookedSeatsResult.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ 
                error: 'Some selected seats are already booked',
                bookedSeats: bookedSeatsResult.rows.map(row => row.Seat_no)
            });
        }
        
        // Insert seat bookings into the existing Booked table
        for (const seatId of selectedSeats) {
            // First, ensure the seat exists in Seat_no table (insert if it doesn't exist)
            const seatExistsQuery = 'SELECT "ID" FROM "Seat_no" WHERE "ID" = $1';
            const seatExists = await client.query(seatExistsQuery, [seatId]);
            
            if (seatExists.rows.length === 0) {
                // Insert seat if it doesn't exist (without isBooked column since it doesn't exist)
                await client.query('INSERT INTO "Seat_no" ("ID") VALUES ($1)', [seatId]);
            }
            
            // Insert booking record
            await client.query(
                'INSERT INTO "Booked" ("user_id", "movie_id", "Seat_no") VALUES ($1, $2, $3)',
                [userId, showData.movie_id, seatId]
            );
        }
        
        // Generate confirmation details
        const confirmationCode = 'BK' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
        
        // Create seat details for response
        const seatDetails = selectedSeats.map(seatId => {
            const rowIndex = Math.floor((seatId - 1) / 15);
            const seatInRow = ((seatId - 1) % 15) + 1;
            const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, C, etc.
            
            return {
                row_letter: rowLetter,
                seat_number: seatInRow,
                seat_type: rowIndex < 3 ? 'premium' : 'regular'
            };
        });
        
        await client.query('COMMIT');
        
        res.status(201).json({
            success: true,
            message: 'Booking confirmed successfully!',
            booking: {
                confirmationCode,
                bookingTime: new Date().toISOString(),
                totalSeats: selectedSeats.length,
                seats: seatDetails,
                show: {
                    movie_name: showData.movie_name,
                    theatre_name: showData.theatre_name,
                    Time: showData.Time
                }
            }
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating booking:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to create booking', details: error.message });
    } finally {
        client.release();
    }
});

// Get user's booking history (using existing schema)
router.get('/user/:userId/bookings', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const bookingsQuery = `
            SELECT 
                b."ID" as booking_id,
                m."name" as movie_name,
                m."Poster" as movie_poster,
                b."Seat_no",
                COUNT(*) OVER (PARTITION BY b."user_id", b."movie_id") as total_seats
            FROM "Booked" b
            JOIN "Movie" m ON b."movie_id" = m."movie_id"
            WHERE b."user_id" = $1
            ORDER BY b."ID" DESC
        `;
        
        const result = await db.query(bookingsQuery, [userId]);
        
        // Group bookings by movie
        const bookingsByMovie = {};
        result.rows.forEach(row => {
            const key = `${row.movie_name}_${row.booking_id}`;
            if (!bookingsByMovie[key]) {
                bookingsByMovie[key] = {
                    booking_id: row.booking_id,
                    movie_name: row.movie_name,
                    movie_poster: row.movie_poster,
                    total_seats: row.total_seats,
                    seats: []
                };
            }
            bookingsByMovie[key].seats.push(row.Seat_no);
        });
        
        res.json({
            bookings: Object.values(bookingsByMovie),
            total: Object.keys(bookingsByMovie).length
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Failed to fetch booking history' });
    }
});

export default router;