import { LostPropertyRequest } from './LostPropertyRequest.js';
import { ValidationError } from '../errors.js';

export class LostPropertyRequestCreator {
  create(payload) {
    const request = new LostPropertyRequest({ ...payload, category: 'Lost Property' });
    const errors = request.validate();
    if (errors.length > 0) throw new ValidationError(errors);
    return request;
  }
}