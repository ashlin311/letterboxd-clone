// lib/db.js
import { Pool } from 'pg';

// Enhanced pool configuration to handle Supabase connection issues
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Connection pool settings to prevent timeouts
  max: 10, // Maximum number of clients in the pool
  min: 1, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  acquireTimeoutMillis: 10000, // Return an error after 10 seconds if a client could not be acquired
  // Keep connections alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Enhanced query function with retry logic
const query = async (text, params, retries = 3) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Query attempt ${i + 1} failed:`, error.message);
      
      // If it's a connection error, wait before retrying
      if (error.code === 'ECONNRESET' || error.code === 'XX000' || error.message.includes('termination')) {
        console.log(`Retrying in ${1000 * (i + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      // For non-connection errors, don't retry
      throw error;
    }
  }
  
  throw lastError;
};

export default {
  query,
  pool, // Export pool for graceful shutdown
};