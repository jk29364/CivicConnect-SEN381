import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Loads .env variables safely
import pool from './config/db.js';


// --- J3: OBSERVER REGISTRATION ---
// Import your service and observers (adjust paths to match your folder structure)
import requestService from './services/RequestService.js'; 
import { DashboardCountsObserver } from './services/observers/DashboardCountsObserver.js';
// Make sure to import your Audit observer here too!
// import { AuditHistoryObserver } from './services/observers/AuditHistoryObserver.js';

// Register the observers at service start
requestService.registerObserver(new DashboardCountsObserver());
// requestService.registerObserver(new AuditHistoryObserver());
console.log(' Observers registered at service start');
// ---------------------------------


// 1. Initialize the Express application
const app = express();

// 2. Middleware Pipeline
// CORS prevents browsers from blocking your React frontend from talking to this backend
app.use(cors()); 
// express.json() tells the server to accept and parse incoming JSON data (like ticket submissions)
app.use(express.json()); 

// 3. Health Check Route
// A simple endpoint to prove the server is alive and routing correctly
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'active', 
        message: 'CivicConnect Core API is securely running.' 
    });
});

// ... existing health route ...

app.get('/api/requests', async (req, res, next) => {
    try {
        // Simulates the dashboard list/filter view (FR-005)
        const { rows } = await pool.query(`
            SELECT id, reference_number, category, status, severity, created_at 
            FROM service_requests 
            ORDER BY created_at DESC 
            LIMIT 100
        `);
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
});

// 4. Global Error Handler
// Catches any crashes in your routes so the server doesn't shut down completely
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong on the backend.'
    });
});

export default app;
