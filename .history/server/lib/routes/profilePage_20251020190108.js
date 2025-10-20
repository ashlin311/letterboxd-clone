import { parse } from "dotenv";
import express from "express";
import supabase from "../sync.js";

const router = express.Router();

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
            
    // Calculate average rating manually
    let finalavg = "0.00";
    if (reviews && reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + (review.Rating || 0), 0);
        const avgRating = totalRating / reviews.length;
        finalavg = avgRating.toFixed(2);
    }
        
    res.json({
        user: profile,
        watchlist: watchlist,
        reviews: reviews,
        average_rating: finalavg
    });
});

// Update profile picture
router.put("/:id/picture", async (req, res) => {
    const { id } = req.params;
    const { profile_pic } = req.body;

    if (!profile_pic) {
        return res.status(400).json({ error: 'Profile picture data is required' });
    }

    try {
        const { data, error } = await supabase
            .from('User')
            .update({ profile_pic: profile_pic })
            .eq('user_id', id)
            .select('user_id, Name, bio, profile_pic')
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            user: data
        });
    } catch (err) {
        console.error('Error updating profile picture:', err);
        res.status(500).json({ error: 'Failed to update profile picture' });
    }
});

export default router;