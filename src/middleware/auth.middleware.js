import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate incoming JWT tokens from the Authorization header.
 * Satisfies NFR-001/ASR-1 
 * Acceptance Criteria: No Token = 401, Invalid Token = 403.
 * 
 * No easy way to test this unfortunately, unless I'm mistaken, in which case please let me know and request changes on review.
 */
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // 1. Acceptance Criteria: No token header at all = 401 Unauthorized
    if (!authHeader) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Access denied. No authentication token provided.'
        });
    }

    // Split the header ("Bearer <token>")
    const parts = authHeader.split(' ');

    // 2. Acceptance Criteria: Malformed structure (e.g., missing "Bearer" prefix or missing token part) = 403 Forbidden
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid token format. Expected "Bearer <token>".'
        });
    }

    const token = parts[1];

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('CRITICAL: JWT_SECRET environment variable is missing.');
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const decoded = jwt.verify(token, secret);
        req.user = decoded; 
        next();
    } catch (error) {
        // 3. Acceptance Criteria: Fake, tempered, or expired token = 403 Forbidden
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid or expired token.'
        });
    }
};


/**
 * Higher-order middleware to enforce role-based access control.
 * Acceptance: Wrong role = 403 Forbidden
 * @param {string[]} allowedRoles - Array of roles allowed to access the route (e.g., ['admin', 'official'])
 */
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Access denied. You do not have the required permissions for this action.'
            });
        }
        next();
    };
};
