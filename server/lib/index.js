import express from "express";
import profilePage from "./routes/profilePage.js";
import movieDetails from "./routes/movieRoute.js";
import authRoute from "./routes/authRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import cors from "cors";

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
            "/reviews": "Review routes"
        }
    });
});

// Import and use your routes here
app.use("/profile", profilePage);
app.use("/movies", movieDetails);
app.use("/auth", authRoute);
app.use("/reviews", reviewRoute);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})
