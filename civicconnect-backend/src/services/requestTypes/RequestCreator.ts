import { Request } from './Request';

/**
 * Blueprint wrapper defining creation steps for sub-creators.
 */
export interface RequestCreator {
  create(payload: any): Request;
}
