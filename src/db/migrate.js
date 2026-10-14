import fs from 'fs';
import pool from '../src/config/db.js';

const runMigration = async () => {
    try {
        console.log('Sending schema to Supabase...');
        
        // Ensure this path matches exactly where you saved the SQL script earlier
        const sql = fs.readFileSync('./src/db/001-initial_schema.sql', 'utf8'); 
        
        await pool.query(sql);
        console.log('✅ Database tables and enums created successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        pool.end();
    }
};

runMigration();