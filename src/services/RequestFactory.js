import { MaintenanceRequestCreator } from './requestTypes/MaintenanceRequestCreator.js';
import { SecurityRequestCreator } from './requestTypes/SecurityRequestCreator.js';

/**
 * ADR-DP-002: Factory Pattern for Request Creation
 * Central router that decides which category-specific request object to instantiate.
 */
export class RequestFactory {
  constructor() {
    this.creators = new Map();
    // Centralized registry for creators (FR-001)
    this.creators.set('Maintenance', new MaintenanceRequestCreator());
    this.creators.set('Security', new SecurityRequestCreator());
    // Future categories (Common Area, Lost Property) register here without changing the public API
  }

  /**
   * Public creation API used by the API controller layer
   * @param {string} category 
   * @param {Object} payload 
   * @returns {Request} category-specific request instance
   */
  create(category, payload) {
    const creator = this.creators.get(category);
    if (!creator) {
      throw new Error(`Unknown category: ${category}`);
    }
    // Delegate to the concrete creator implementation
    return creator.create(payload);
  }
}

// Exported as a singleton instance for global access
export const requestFactory = new RequestFactory();