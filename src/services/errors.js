export class ValidationError extends Error {
    constructor(errors) {
        super(`Validation failed: ${errors.join('; ')}`);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}