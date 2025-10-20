import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the root directory (two levels up from server/lib)
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

import express from "express";
import profilePage from "./routes/profilePage.js";
import movieDetails from "./routes/movieRoute.js";
import authRoute from "./routes/authRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import watchlistRoute from "./routes/watchlistRoute.js";
import bookingRoute from "./routes/bookingRoute.js";
import cors from "cors";
import db from "./db.js";

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',}));
      
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ 
        message: "Letterboxd Clone", 
        endpoints: {
            "/profile": "Profile routes",
            "/movies": "Movie routes",
            "/auth": "Authentication routes",
            "/reviews": "Review routes",
            "/watchlist": "Watchlist routes",
            "/bookings": "Booking routes",
            "/health": "Health check"
        }
    });
});

// Health check endpoint to test database connection
app.get("/health", async (req, res) => {
    try {
        // Test database connection
        const result = await db.query('SELECT NOW()');
        res.json({ 
            status: 'healthy', 
            database: 'connected',
            timestamp: result.rows[0].now
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: error.message
        });
    }
});

// Import and use your routes here
app.use("/profile", profilePage);
app.use("/movies", movieDetails);
app.use("/auth", authRoute);
app.use("/reviews", reviewRoute);
app.use("/watchlist", watchlistRoute);
app.use("/bookings", bookingRoute);

const server = app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

// Graceful shutdown handling
const gracefulShutdown = () => {
    console.log('Received shutdown signal, shutting down gracefully...');
    
    server.close(() => {
        console.log('HTTP server closed.');
        
        // Close database pool
        db.pool.end(() => {
            console.log('Database pool closed.');
            process.exit(0);
        });
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown();
});
