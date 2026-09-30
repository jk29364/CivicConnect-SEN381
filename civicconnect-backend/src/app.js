const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Loads your .env variables safely

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

// 4. Global Error Handler
// Catches any crashes in your routes so the server doesn't shut down completely
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong on the backend.'
    });
});

// 5. Boot the Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`[CivicConnect] Server successfully started on port ${PORT}`);
});

module.exports = app;
