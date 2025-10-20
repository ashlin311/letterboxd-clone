import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server directory
const envPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
config({ path: envPath });

// Debug logging
console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://jozqmeoiyxzqpvjmauzu.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvenFtZW9peXh6cXB2am1hdXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MzE5NzYsImV4cCI6MjA1MDAwNzk3Nn0.4bxLPCNXl5w0_EoJi6mFBtjfr8K6oPp-D6_Q4KtY7h8'
);

export default supabase;



