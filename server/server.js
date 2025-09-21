const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const db = require('./lib/db');
const movieRoute = require('./Routes/movieRoute');

const app = express();
const PORT = process.env.PORT || 3000;

db.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log('Database connection error:', err);
    } else {
        console.log('Database connected');
        app.use(cors());
        app.use(express.json());
        app.use('/movies', movieRoute);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
});