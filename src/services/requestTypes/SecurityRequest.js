import { Request, isValidPastDate } from './Request.js';

export class SecurityRequest extends Request {
    constructor(payload) {
        super(payload);
        this.incidentTime = payload.incidentTime;
        this.threatLevel = payload.threatLevel;
    }
    validate() {
        const errors = super.validate();
        if (!isValidPastDate(this.incidentTime)) errors.push('incidentTime must be a valid date/time that is not in the future');
        if (!this.threatLevel) errors.push('threatLevel is required for Security requests');
        return errors;
    }
}