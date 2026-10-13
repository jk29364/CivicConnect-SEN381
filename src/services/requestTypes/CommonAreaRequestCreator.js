import { CommonAreaRequest } from './CommonAreaRequest.js';
import { ValidationError } from '../errors.js';

export class CommonAreaRequestCreator {
  create(payload) {
    const request = new CommonAreaRequest({ ...payload, category: 'Common Area' });
    const errors = request.validate();
    if (errors.length > 0) throw new ValidationError(errors);
    return request;
  }
}