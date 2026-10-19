import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import requestService from './services/RequestService.js';
import { DashboardCountsObserver } from './services/observers/DashboardCountsObserver.js';
import { authenticateToken, requireRole } from './middleware/auth.middleware.js';
import requestController from './middleware/request.controller.js';
import authRouter from './routes/auth.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// The audit observer is always present in RequestService; this observer handles
// future dashboard cache invalidation without duplicating audit entries.
requestService.registerObserver(new DashboardCountsObserver());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'active',
        message: 'CivicConnect Core API is securely running.'
    });
});

app.use('/api/auth', authRouter);

// FR-001/FR-010: resident submission; JWT identity is the source of submittedBy.
app.post('/api/requests', authenticateToken, requireRole(['Resident']),
    (req, res) => requestController.createRequest(req, res));

// FR-005: authorised, estate-scoped list/filter/sort and request detail.
app.get('/api/requests', authenticateToken, requireRole(['Resident', 'Staff', 'Agent']),
    (req, res) => requestController.getRequests(req, res));
app.get('/api/requests/:id', authenticateToken, requireRole(['Resident', 'Staff', 'Agent']),
    (req, res) => requestController.getRequestById(req, res));

// FR-002/NFR-004: status changes use optimistic concurrency and transactional audit.
app.put('/api/requests/:id/status', authenticateToken, requireRole(['Staff', 'Agent']),
    (req, res) => requestController.updateStatus(req, res));

app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'ValidationError', message: 'Invalid JSON body' });
    }
    console.error('Unhandled API error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
