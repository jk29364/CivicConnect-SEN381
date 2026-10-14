import { SecurityRequest } from './SecurityRequest.js';
import { ValidationError } from '../errors.js';

export class SecurityRequestCreator {
  create(payload) {
    const request = new SecurityRequest({ ...payload, category: 'Security' });
    const errors = request.validate();
    if (errors.length > 0) throw new ValidationError(errors);
    return request;
  }
}