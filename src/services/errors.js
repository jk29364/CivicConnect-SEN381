/** Errors representing expected domain failures rather than server faults. */
export class ValidationError extends Error {
    constructor(errors) {
        const messages = Array.isArray(errors) ? errors.map(String) : [String(errors)];
        super(`Validation failed: ${messages.join('; ')}`);
        this.name = 'ValidationError';
        this.errors = messages;
    }
}

export class NotFoundError extends Error {
    constructor(message = 'Request not found.') {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class ConflictError extends Error {
    constructor(message = 'The request was modified by another user.') {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}
