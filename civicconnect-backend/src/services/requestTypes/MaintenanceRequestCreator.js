import { Request } from './Request.js';

// Specific request object structural class definition
class MaintenanceRequest extends Request {
  constructor(payload) {
    super(payload);
    this.faultType = payload.faultType; // Specific structural attribute rule
  }

  validate() {
    // Custom functional evaluation rules matching structural maintenance criteria
    return !!(this.location && this.faultType);
  }
}

/**
 * Creator implementation encapsulating maintenance validation limits
 */
export class MaintenanceRequestCreator {
  create(payload) {
    const request = new MaintenanceRequest(payload);
    if (!request.validate()) {
      throw new Error("Validation Failed: Location and faultType are mandatory for Maintenance requests.");
    }
    return request;
  }
}
