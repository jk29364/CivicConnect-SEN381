import app from './app.js'; // Import the Express app from app.js

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`[CivicConnect] Server successfully started on port ${PORT}`);
});