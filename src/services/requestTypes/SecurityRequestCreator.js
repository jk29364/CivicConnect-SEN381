import { Request } from './Request.js';

// Specific request object structural class definition
class SecurityRequest extends Request {
  constructor(payload) {
    super(payload);
    this.incidentTime = payload.incidentTime;
    this.threatLevel = payload.threatLevel; // Specific structural attribute rule
  }

  validate() {
    // Custom validation logic tracking threat parameters limits
    return !!(this.incidentTime && this.threatLevel);
  }
}

/**
 * Creator implementation encapsulating security validation bounds
 */
export class SecurityRequestCreator {
  create(payload) {
    const request = new SecurityRequest(payload);
    if (!request.validate()) {
      throw new Error("Validation Failed: Incident time and threat level are mandatory for Security requests.");
    }
    return request;
  }
}
