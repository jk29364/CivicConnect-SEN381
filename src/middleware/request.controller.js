import RequestService from '../services/RequestService.js';
import { ValidationError, NotFoundError, ConflictError } from '../services/errors.js';

// req.user is populated only by authenticateToken after jwt.verify succeeds.
const verifiedId = (req) => req.user?.id ?? req.user?.sub;

function handleError(res, error) {
    if (error instanceof ValidationError) {
        return res.status(400).json({
            error: 'ValidationError', message: error.message, details: error.errors
        });
    }
    if (error instanceof NotFoundError) {
        return res.status(404).json({ error: 'Not Found', message: error.message });
    }
    if (error instanceof ConflictError) {
        return res.status(409).json({ error: 'Conflict', message: error.message });
    }
    console.error('Request API unexpected error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
}

class RequestController {
    async createRequest(req, res) {
        const userId = verifiedId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        try {
            // Explicitly overwrite any forged submittedBy in the request body.
            const request = await RequestService.createRequest({
                ...(req.body ?? {}), submittedBy: userId
            });
            return res.status(201).json({
                message: 'Service request created',
                referenceNumber: request.referenceNumber,
                request
            });
        } catch (error) {
            return handleError(res, error);
        }
    }

    async getRequests(req, res) {
        const userId = verifiedId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        try {
            const requests = await RequestService.getRequests(req.query, userId);
            return res.status(200).json(requests);
        } catch (error) {
            return handleError(res, error);
        }
    }

    async getRequestById(req, res) {
        const userId = verifiedId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        try {
            const request = await RequestService.getRequestById(req.params.id, userId);
            if (!request) return res.status(404).json({ error: 'Request not found' });
            return res.status(200).json(request);
        } catch (error) {
            return handleError(res, error);
        }
    }

    async updateStatus(req, res) {
        const userId = verifiedId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { status, version } = req.body ?? {};
        if (typeof status !== 'string' || !status.trim()) {
            return res.status(400).json({ error: 'ValidationError', message: 'status is required' });
        }
        try {
            const request = await RequestService.updateRequestStatus(
                req.params.id, status, version, userId
            );
            return res.status(200).json({ message: 'Status updated', request });
        } catch (error) {
            return handleError(res, error);
        }
    }
}

export default new RequestController();
