import fs from 'node:fs/promises';
import pool from '../config/db.js';

// Run with `npm run db:migrate` on a fresh database, or
// `npm run db:indexes` on an already-initialised database.
const files = process.argv.includes('--indexes-only')
    ? ['002-request-filter-indexes.sql']
    : ['001-initial_Schema.sql', '002-request-filter-indexes.sql'];

try {
    for (const file of files) {
        const path = new URL(`./${file}`, import.meta.url);
        console.log(`Applying ${file}...`);
        await pool.query(await fs.readFile(path, 'utf8'));
    }
    console.log('Database migrations applied.');
} catch (error) {
    console.error('Database migration failed:', error);
    process.exitCode = 1;
} finally {
    await pool.end();
}
