import { parse } from "dotenv";
import express from "express";
import supabase from "../sync.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
    const {id} = req.params;

    const {data: profile, error: profileError} = await supabase
        .from('user')
        .select('user_id,name,bio,profile_pic')
        .eq('user_id', id)
        .single();

        if (profileError) {
            return res.status(400).json({ error: profileError.message });
        }
    
    const {data: watchlist, error: watchlistError} = await supabase
        .from('watchlist')
        .select('created_at , movie(name,poster)')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

        if (watchlistError) {
            return res.status(400).json({ error: watchlistError.message });
        }

    const {data: reviews, error: reviewsError} = await supabase
        .from('review')
        .select('added_at, rating, review_text, movie(name,poster)')
        .eq('user_id', id)
        .order('added_at', { ascending: false });

        if(reviewsError) {
            return res.status(400).json({error: reviewsError.message });
            }
            
    const {data: avgrating} = await supabase
    .from('review')
    .select('avg(rating)')
    .eq('user_id', id)
    .single();

    const finalavg = parseFloat(avgrating.avg).toFixed(2);
        
    res.json({
        user: profile,
        watchlist: watchlist,
        reviews: reviews,
        average_rating: finalavg
    });
});

export default router;