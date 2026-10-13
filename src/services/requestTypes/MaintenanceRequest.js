import { Request } from './Request.js';
export class MaintenanceRequest extends Request {
    constructor(payload) {
        super(payload);
        this.faultType = payload.faultType;
    }
    validate() {
        const errors = super.validate();
        if (!this.location) errors.push ('location is required for Maintenance requests');
        if (!this.faultType) errors.push ('faultType is required for Maintenance requests');
        return errors;
    }
}