// src/config/db.js
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// Initializes the connection pool using your Supabase connection string
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase connections
    }
});

export default pool;