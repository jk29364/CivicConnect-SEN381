const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Access denied. No authentication token provided.'
        });
    }

    try {
        // Simulating a decoded token for M2 development
        req.user = { id: 'resident_123', role: 'resident' };
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = authenticateToken;