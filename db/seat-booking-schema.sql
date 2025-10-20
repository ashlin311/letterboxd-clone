-- Enhanced Schema for Seat Selection and Booking System
-- This script adds proper seat management tables to support seat selection

-- Drop existing seat-related tables to recreate with better structure
DROP TABLE IF EXISTS "booking_seats" CASCADE;
DROP TABLE IF EXISTS "seats" CASCADE;
DROP TABLE IF EXISTS "bookings" CASCADE;

-- Update the existing Booked table structure to be more specific
DROP TABLE IF EXISTS "Booked" CASCADE;

-- Create a proper seats table with row and column information
CREATE TABLE "seats" (
    "seat_id" SERIAL PRIMARY KEY,
    "theatre_id" INTEGER NOT NULL,
    "row_letter" VARCHAR(2) NOT NULL, -- A, B, C, etc.
    "seat_number" INTEGER NOT NULL, -- 1, 2, 3, etc.
    "seat_type" VARCHAR(20) DEFAULT 'regular', -- regular, premium, vip
    "is_active" BOOLEAN DEFAULT TRUE, -- for maintenance/broken seats
    FOREIGN KEY ("theatre_id") REFERENCES "Theatre"("Theatre_id"),
    UNIQUE("theatre_id", "row_letter", "seat_number")
);

-- Create bookings table to track booking sessions
CREATE TABLE "bookings" (
    "booking_id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "show_id" INTEGER NOT NULL,
    "booking_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "total_seats" INTEGER NOT NULL,
    "booking_status" VARCHAR(20) DEFAULT 'confirmed', -- confirmed, cancelled
    "confirmation_code" VARCHAR(50) UNIQUE,
    FOREIGN KEY ("user_id") REFERENCES "User"("user_id"),
    FOREIGN KEY ("show_id") REFERENCES "Showtime"("Show_id")
);

-- Create junction table for booking and seats (many-to-many)
CREATE TABLE "booking_seats" (
    "booking_seat_id" SERIAL PRIMARY KEY,
    "booking_id" INTEGER NOT NULL,
    "seat_id" INTEGER NOT NULL,
    "show_id" INTEGER NOT NULL,
    FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE,
    FOREIGN KEY ("seat_id") REFERENCES "seats"("seat_id"),
    FOREIGN KEY ("show_id") REFERENCES "Showtime"("Show_id"),
    UNIQUE("seat_id", "show_id") -- Prevent double booking of same seat for same show
);

-- Insert sample seats for existing theatres
-- Assuming we have theatres with IDs 1, 2, 3, etc.
-- Each theatre will have 10 rows (A-J) with 15 seats each

DO $$
DECLARE
    theatre_record RECORD;
    row_letter CHAR;
    seat_num INTEGER;
BEGIN
    -- Get all existing theatres
    FOR theatre_record IN SELECT "Theatre_id" FROM "Theatre" LOOP
        -- Create seats for rows A through J
        FOR i IN 1..10 LOOP
            row_letter := CHR(64 + i); -- Convert 1=A, 2=B, etc.
            
            -- Create 15 seats per row
            FOR seat_num IN 1..15 LOOP
                INSERT INTO "seats" ("theatre_id", "row_letter", "seat_number", "seat_type")
                VALUES (
                    theatre_record."Theatre_id",
                    row_letter,
                    seat_num,
                    CASE 
                        WHEN i <= 3 THEN 'premium'  -- First 3 rows are premium
                        WHEN i >= 8 THEN 'regular'  -- Last 3 rows are regular
                        ELSE 'regular'              -- Middle rows are regular
                    END
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX idx_seats_theatre ON "seats"("theatre_id");
CREATE INDEX idx_booking_seats_show ON "booking_seats"("show_id");
CREATE INDEX idx_booking_seats_seat ON "booking_seats"("seat_id");
CREATE INDEX idx_bookings_user ON "bookings"("user_id");
CREATE INDEX idx_bookings_show ON "bookings"("show_id");

-- Add some sample bookings to test the system
-- (These would normally be created through the application)
INSERT INTO "bookings" ("user_id", "show_id", "total_seats", "confirmation_code")
SELECT 1, s."Show_id", 2, 'CONF' || LPAD(s."Show_id"::text, 6, '0')
FROM "Showtime" s 
LIMIT 1;

-- Book a couple of seats for the sample booking
-- This demonstrates how seats get reserved
INSERT INTO "booking_seats" ("booking_id", "seat_id", "show_id")
SELECT 
    b."booking_id",
    st."seat_id",
    b."show_id"
FROM "bookings" b
CROSS JOIN "seats" st
WHERE st."row_letter" = 'A' 
AND st."seat_number" IN (5, 6)
AND st."theatre_id" = (
    SELECT sh."Theatre_id" 
    FROM "Showtime" sh 
    WHERE sh."Show_id" = b."show_id"
)
LIMIT 2;