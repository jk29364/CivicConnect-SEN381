import { MaintenanceRequest } from './MaintenanceRequest.js';
import { ValidationError } from '../errors.js';

export class MaintenanceRequestCreator {
  create(payload) {
    const request = new MaintenanceRequest({ ...payload, category: 'Maintenance' });
    const errors = request.validate();
    if (errors.length > 0) throw new ValidationError(errors);
    return request;
  }
}