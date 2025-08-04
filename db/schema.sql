-- This script creates the database schema for the BookMyShow clone project.
-- It is now "idempotent", meaning it can be run multiple times without error.
-- It will first DROP (delete) all tables if they exist, and then recreate them.

-- Drop existing tables in the reverse order of creation to handle dependencies.
-- The CASCADE option automatically removes dependent objects like foreign keys.

DROP TABLE IF EXISTS "movie_cast" CASCADE;
DROP TABLE IF EXISTS "Booked" CASCADE;
DROP TABLE IF EXISTS "Showtime" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "Movie" CASCADE;
DROP TABLE IF EXISTS "Theatre" CASCADE;
DROP TABLE IF EXISTS "Seat_no" CASCADE;
DROP TABLE IF EXISTS "Districts" CASCADE;
DROP TABLE IF EXISTS "Director" CASCADE;
DROP TABLE IF EXISTS "Cast" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;


-- Independent Tables (No foreign keys)
-- These tables can be created first as they don't depend on any other tables.

CREATE TABLE "User" (
    "user_id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(255) NOT NULL,
    "Password" VARCHAR(255) NOT NULL -- In a real app, this should be a hashed password
);

CREATE TABLE "Cast" (
    "cast_id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "photo" TEXT -- URL to the photo
);

CREATE TABLE "Director" (
    "Dir_id" SERIAL PRIMARY KEY,
    "Dir_name" VARCHAR(255) NOT NULL
);

CREATE TABLE "Districts" (
    "District_id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(255) NOT NULL
);

CREATE TABLE "Seat_no" (
    "ID" SERIAL PRIMARY KEY,
    "isBooked" BOOLEAN DEFAULT FALSE
    -- You might want to add row and column numbers here for a real seating map
);


-- Dependent Tables (With foreign keys)
-- These tables depend on the ones created above.

CREATE TABLE "Theatre" (
    "Theatre_id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(255) NOT NULL,
    "District_id" INTEGER NOT NULL,
    FOREIGN KEY ("District_id") REFERENCES "Districts"("District_id")
);

CREATE TABLE "Movie" (
    "movie_id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "language" VARCHAR(50),
    "Release_Date" DATE,
    "Synopsis" TEXT,
    "now_showing" BOOLEAN,
    "runtime" INTEGER, -- Runtime in minutes
    "Poster" TEXT, -- URL to the poster image
    "Trailer" TEXT, -- URL to the trailer video
    "Rating" DECIMAL(3, 1), -- e.g., 8.5
    "Dir_id" INTEGER,
    FOREIGN KEY ("Dir_id") REFERENCES "Director"("Dir_id")
);

CREATE TABLE "Review" (
    "Review_id" SERIAL PRIMARY KEY,
    "Rating" DECIMAL(3, 1) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "User"("user_id"),
    FOREIGN KEY ("movie_id") REFERENCES "Movie"("movie_id")
);

CREATE TABLE "Showtime" (
    "Show_id" SERIAL PRIMARY KEY,
    "Time" TIMESTAMP NOT NULL, -- Includes both date and time
    "Theatre_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,
    FOREIGN KEY ("Theatre_id") REFERENCES "Theatre"("Theatre_id"),
    FOREIGN KEY ("movie_id") REFERENCES "Movie"("movie_id")
);

CREATE TABLE "Booked" (
    "ID" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "Seat_no" INTEGER NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "User"("user_id"),
    FOREIGN KEY ("movie_id") REFERENCES "Movie"("movie_id"),
    FOREIGN KEY ("Seat_no") REFERENCES "Seat_no"("ID")
);


-- Join Table (Many-to-Many relationship)
-- This table connects movies and cast members.

CREATE TABLE "movie_cast" (
    "movie_id" INTEGER NOT NULL,
    "cast_id" INTEGER NOT NULL,
    PRIMARY KEY ("movie_id", "cast_id"), -- Composite primary key
    FOREIGN KEY ("movie_id") REFERENCES "Movie"("movie_id"),
    FOREIGN KEY ("cast_id") REFERENCES "Cast"("cast_id")
);

-- --- End of Script ---
