-- Migration: Remove Seat_no table
-- Date: 2025-10-20
-- Reason: Table not serving any purpose - seat info is calculated dynamically

-- Step 1: Drop the foreign key constraint from Booked table
ALTER TABLE "Booked" DROP CONSTRAINT IF EXISTS "Booked_Seat_no_fkey";

-- Step 2: Drop the Seat_no table
DROP TABLE IF EXISTS "Seat_no" CASCADE;

-- Note: The Seat_no column in Booked table will remain as a simple integer
-- This column stores the seat ID (1-150) which is used to identify which seat was booked
