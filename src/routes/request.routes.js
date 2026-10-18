// src/routes/request.routes.js
const express = require('express');
const router = express.Router();
const RequestController = require('../middleware/request.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect all asset allocation tracking mutations with verified auth processing blocks
router.post('/', authMiddleware, RequestController.createRequest);
router.get('/', authMiddleware, RequestController.getRequests);
router.get('/:id', authMiddleware, RequestController.getRequestById);
router.put('/:id/status', authMiddleware, RequestController.updateStatus);

module.exports = router;
