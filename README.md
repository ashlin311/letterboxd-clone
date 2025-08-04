# letterboxd-clone
This project is the complete backend implementation for a movie ticket booking website, mirroring the core functionalities of platforms like BookMyShow. It is built using a modern, scalable architecture to handle everything from user authentication to real-time seat selection.

The API provides endpoints for:

»Managing users, movies, theatres, and showtimes.

»A robust booking system with seat availability checks.

»Submitting and retrieving user-generated reviews and ratings.

Technology Stack:

»Framework: Next.js (API Routes) / Node.js

»Database: PostgreSQL

»ORM: Prisma

»Language: JavaScript/TypeScript

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database (Supabase recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd letterboxd-clone
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Set up database connection:**
   
   **This project uses a shared team Supabase database.**
   
   a. Copy the environment template:
      ```bash
      cp .env.example .env
      ```
   
   b. Get the team database connection string:
      - Ask your team lead for the Supabase pooler connection string
      - Or if you have access: Go to your team's Supabase project > Settings > Database
      - Copy the **pooler connection string** (not the direct connection)
      - It should look like: `postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres`
   
   c. Add the connection string to your `.env` file:
      ```
      DATABASE_URL="your-team-connection-string-here"
      ```

4. **Configure environment variables:**

4. **Test the database connection:**
   ```bash
   npm test
   ```

### Important Notes

- **� Keep the `.env` file private** - Never commit it to git
- **📋 The database schema is already set up** in the team Supabase project
- **👥 All team members use the same database** for collaborative development
- **🚨 Be careful with test data** - Others can see what you insert/modify

### Database Schema

The database schema is located in `db/schema.sql`. You can run this in your Supabase SQL editor to set up the required tables.

## Running the Application

```bash
cd server
npm run dev
```
