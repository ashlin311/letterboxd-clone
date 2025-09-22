const db = require('../db');

exports.getMovieById = async(req, res) => {
    const  movieId = req.params.id;
    console.log(movieId);
    try{
        const result = await db.query('SELECT * FROM "Movie" WHERE movie_id = $1', [movieId]);
        console.log(result.rows);
        if (result.rows.length===0){
            return res.status(404).json({error: "Movie not found"});
        }
        else res.json(result.rows[0]);
    }
    catch(err){
        res.status(500).json({error: "Internal server error"}); 
        console.log(err);
    }
}

