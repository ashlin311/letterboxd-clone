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

-- Supabase Schema for reference

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Booked (
  ID integer NOT NULL DEFAULT nextval('"Booked_ID_seq"'::regclass),
  user_id integer NOT NULL,
  movie_id integer NOT NULL,
  Seat_no integer NOT NULL,
  CONSTRAINT Booked_pkey PRIMARY KEY (ID),
  CONSTRAINT Booked_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.Movie(movie_id),
  CONSTRAINT Booked_Seat_no_fkey FOREIGN KEY (Seat_no) REFERENCES public.Seat_no(ID),
  CONSTRAINT Booked_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id)
);
CREATE TABLE public.Cast (
  cast_id integer NOT NULL DEFAULT nextval('"Cast_cast_id_seq"'::regclass),
  name character varying NOT NULL,
  photo text,
  CONSTRAINT Cast_pkey PRIMARY KEY (cast_id)
);
CREATE TABLE public.Director (
  Dir_id integer NOT NULL DEFAULT nextval('"Director_Dir_id_seq"'::regclass),
  Dir_name character varying NOT NULL,
  CONSTRAINT Director_pkey PRIMARY KEY (Dir_id)
);
CREATE TABLE public.Districts (
  District_id integer NOT NULL DEFAULT nextval('"Districts_District_id_seq"'::regclass),
  Name character varying NOT NULL,
  CONSTRAINT Districts_pkey PRIMARY KEY (District_id)
);
CREATE TABLE public.Movie (
  movie_id integer NOT NULL DEFAULT nextval('"Movie_movie_id_seq"'::regclass),
  name character varying NOT NULL,
  language character varying,
  Release_Date date,
  Synopsis text,
  now_showing boolean,
  runtime integer,
  Poster text,
  Trailer text,
  Rating numeric,
  Dir_id integer,
  CONSTRAINT Movie_pkey PRIMARY KEY (movie_id),
  CONSTRAINT Movie_Dir_id_fkey FOREIGN KEY (Dir_id) REFERENCES public.Director(Dir_id)
);
CREATE TABLE public.Review (
  Review_id integer NOT NULL DEFAULT nextval('"Review_Review_id_seq"'::regclass),
  Rating numeric NOT NULL,
  user_id integer NOT NULL,
  movie_id integer NOT NULL,
  review_text text,
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT Review_pkey PRIMARY KEY (Review_id),
  CONSTRAINT Review_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id),
  CONSTRAINT Review_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.Movie(movie_id)
);
CREATE TABLE public.Seat_no (
  ID integer NOT NULL DEFAULT nextval('"Seat_no_ID_seq"'::regclass),
  isBooked boolean DEFAULT false,
  CONSTRAINT Seat_no_pkey PRIMARY KEY (ID)
);
CREATE TABLE public.Showtime (
  Show_id integer NOT NULL DEFAULT nextval('"Showtime_Show_id_seq"'::regclass),
  Time timestamp without time zone NOT NULL,
  Theatre_id integer NOT NULL,
  movie_id integer NOT NULL,
  CONSTRAINT Showtime_pkey PRIMARY KEY (Show_id),
  CONSTRAINT Showtime_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.Movie(movie_id),
  CONSTRAINT Showtime_Theatre_id_fkey FOREIGN KEY (Theatre_id) REFERENCES public.Theatre(Theatre_id)
);
CREATE TABLE public.Theatre (
  Theatre_id integer NOT NULL DEFAULT nextval('"Theatre_Theatre_id_seq"'::regclass),
  Name character varying NOT NULL,
  District_id integer NOT NULL,
  CONSTRAINT Theatre_pkey PRIMARY KEY (Theatre_id),
  CONSTRAINT Theatre_District_id_fkey FOREIGN KEY (District_id) REFERENCES public.Districts(District_id)
);
CREATE TABLE public.User (
  user_id integer NOT NULL DEFAULT nextval('"User_user_id_seq"'::regclass),
  Name character varying NOT NULL,
  Password character varying NOT NULL,
  bio text,
  profile_pic text,
  CONSTRAINT User_pkey PRIMARY KEY (user_id)
);
 -- Join Table for Many-to-Many relationship between User and Movie for Watchlist feature
CREATE TABLE public.Watchlist (
  watchlist_id integer GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  user_id integer NOT NULL,
  movie_id integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Watchlist_pkey PRIMARY KEY (watchlist_id, user_id, movie_id, created_at),
  CONSTRAINT Watchlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id),
  CONSTRAINT Watchlist_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.Movie(movie_id)
);


CREATE TABLE public.movie_cast (
  movie_id integer NOT NULL,
  cast_id integer NOT NULL,
  CONSTRAINT movie_cast_pkey PRIMARY KEY (movie_id, cast_id),
  CONSTRAINT movie_cast_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.Movie(movie_id),
  CONSTRAINT movie_cast_cast_id_fkey FOREIGN KEY (cast_id) REFERENCES public.Cast(cast_id)
);