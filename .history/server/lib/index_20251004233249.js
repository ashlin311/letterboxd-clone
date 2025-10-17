import express from "express";
import profilePage from "./routes/profilePage.js";
import movieDetails from "./routes/movieRoute.js";
import authRoute from "./routes/authRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import watchlistRoute from "./routes/watchlistRoute.js";
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
            "/watchlist": "Watchlist routes"
        }
    });
});

// Import and use your routes here
app.use("/profile", profilePage);
app.use("/movies", movieDetails);
app.use("/auth", authRoute);
app.use("/reviews", reviewRoute);
app.use("/watchlist", watchlistRoute);

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
