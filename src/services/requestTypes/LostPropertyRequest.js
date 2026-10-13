import { Request, isValidPastDate } from './Request.js';

export class LostPropertyRequest extends Request {
    constructor(payload) {
        super(payload);
        this.itemName = payload.itemName;
        this.dateLastSeen = payload.dateLastSeen;
    }
    validate(){
        const errors = super.validate();
        if (!this.itemName) errors.push('itemName is required for Lost Property requests');
        if (!isValidPastDate(this.dateLastSeen)) errors.push('dateLastSeen must be a valid date that is no in the future');
        return errors;
    }
}