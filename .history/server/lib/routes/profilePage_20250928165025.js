import { parse } from "dotenv";
import express from "express";
import supabase from "../sync.js";

const router = express.Router();

// Get current user profile (without ID - for logged in user)
router.get("/", async (req, res) => {
    // For now, we'll use a default user ID (1) since we don't have authentication
    // In a real app, this would come from the authenticated session
    const defaultUserId = 1;
    
    try {
        console.log('Fetching profile for user ID:', defaultUserId);
        
        const {data: profile, error: profileError} = await supabase
            .from('User')
            .select('user_id,Name,bio,profile_pic')
            .eq('user_id', defaultUserId)
            .single();

        if (profileError) {
            console.error('Profile error:', profileError);
            return res.status(404).json({ 
                error: profileError.message,
                message: "User not found. Make sure user with ID 1 exists in the database."
            });
        }
        
        console.log('Profile found:', profile);
        
        const {data: reviews, error: reviewsError} = await supabase
            .from('Review')
            .select('Rating')
            .eq('user_id', defaultUserId);

        if(reviewsError) {
            console.error('Reviews error:', reviewsError);
            // Don't fail the whole request, just set empty reviews
        }
        
        // Calculate average rating
        const ratings = reviews ? reviews.map(r => r.Rating).filter(r => r !== null && r !== undefined) : [];
        const averageRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
        
        const profileResponse = {
            name: profile.Name || "Anonymous User",
            memberSince: "January 2024", // You could add a created_at field to User table
            about: profile.bio || "No bio available.",
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews: ratings.length,
            avatar: profile.profile_pic || "/api/placeholder/120/120"
        };
        
        console.log('Sending profile response:', profileResponse);
        res.json(profileResponse);
        
    } catch (error) {
        console.error('Unexpected error in profile route:', error);
        res.status(500).json({ 
            error: "Failed to fetch profile data",
            details: error.message
        });
    }
});

// Get current user watchlist
router.get("/watchlist", async (req, res) => {
    const defaultUserId = 1;
    
    try {
        const {data: watchlist, error: watchlistError} = await supabase
            .from('Watchlist')
            .select('created_at, Movie(movie_id, name, Poster, Release_Date)')
            .eq('user_id', defaultUserId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (watchlistError) {
            return res.status(400).json({ error: watchlistError.message });
        }

        const formattedWatchlist = watchlist.map(item => ({
            id: item.Movie.movie_id,
            title: item.Movie.name,
            year: item.Movie.Release_Date ? new Date(item.Movie.Release_Date).getFullYear() : "Unknown",
            poster: item.Movie.Poster || "/api/placeholder/150/225",
            addedAt: item.created_at
        }));

        res.json({ movies: formattedWatchlist });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch watchlist data" });
    }
});

// Get current user recent reviews
router.get("/reviews", async (req, res) => {
    const defaultUserId = 1;
    
    try {
        const {data: reviews, error: reviewsError} = await supabase
            .from('Review')
            .select('review_id, added_at, Rating, review_text, Movie(name)')
            .eq('user_id', defaultUserId)
            .order('added_at', { ascending: false })
            .limit(5);

        if(reviewsError) {
            return res.status(400).json({error: reviewsError.message });
        }

        const formattedReviews = reviews.map(review => ({
            id: review.review_id,
            movie: review.Movie.name,
            rating: review.Rating,
            date: new Date(review.added_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            review: review.review_text || "No review text available."
        }));
            
        res.json({ reviews: formattedReviews });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews data" });
    }
});

// Get specific user profile by ID
router.get("/:id", async (req, res) => {
    const {id} = req.params;

    const {data: profile, error: profileError} = await supabase
        .from('User')
        .select('user_id,Name,bio,profile_pic')
        .eq('user_id', id)
        .single();

        if (profileError) {
            return res.status(400).json({ error: profileError.message });
        }
    
    const {data: watchlist, error: watchlistError} = await supabase
        .from('Watchlist')
        .select('created_at , Movie(name,Poster)')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

        if (watchlistError) {
            return res.status(400).json({ error: watchlistError.message });
        }

    const {data: reviews, error: reviewsError} = await supabase
        .from('Review')
        .select('added_at, Rating, review_text, Movie(name,Poster)')
        .eq('user_id', id)
        .order('added_at', { ascending: false });

        if(reviewsError) {
            return res.status(400).json({error: reviewsError.message });
            }
            
    const {data: avgrating} = await supabase
    .from('Review')
    .select('avg(Rating)')
    .eq('user_id', id)
    .single();

    const finalavg = avgrating && avgrating.avg ? parseFloat(avgrating.avg).toFixed(2) : "0.00";
        
    res.json({
        user: profile,
        watchlist: watchlist,
        reviews: reviews,
        average_rating: finalavg
    });
});

export default router;