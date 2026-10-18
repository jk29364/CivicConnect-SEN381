export const SEVERITIES = ['Low', 'Medium', 'High'];

//Base model providing initial structural guarantees (FR-001 & FR-011)
//subclasses will implement validate()

export class Request {
    constructor(payload) {
        this.id = Math.random().toString(36).slice(2, 11); //this is a mock ID, it will be replaced by DB-generated references (FR-010)
        this.category = payload.category;
        this.description = payload.description;
        this.location = payload.location;
        this.submittedBy = payload.submittedBy;
        this.severity = payload.severity ?? 'Low'; //FR-011 default
        this.status = 'New';
        this.createdAt = new Date();
    }

    //Returns list of error messages; empty list means valid
    validate() {
        const errors = [];
        if (!this.description || !String(this.description).trim()) errors.push('description is required');
        if (!this.location || !String(this.location).trim()) errors.push('location is required');
        if (!SEVERITIES.includes(this.severity)) errors.push(`severity must be one of ${SEVERITIES.join(', ')}`);
        return errors;
    }
}

export function isValidPastDate(value) {
    const d = new Date(value);
    return value != null && !Number.isNaN(d.getTime()) && d <= new Date();
}