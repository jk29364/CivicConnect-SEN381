import { Request } from './Request.js';
export class CommonAreaRequest extends Request {
    constructor(payload) {
        super(payload);
        this.areaName = payload.areaName;
    }
    validate() {
        const errors = super.validate();
        if (!this.areaName) errors.push('areaName is required for Common Area requests');
        return errors;
    }
}