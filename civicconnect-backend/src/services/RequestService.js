/**
 * ADR-DP-001: Observer Pattern for Status-Change Notification
 * Maintains the list of active listeners and broadcasts status transitions synchronously.
 */
export class RequestService {
  constructor() {
    this.observers = []; // Array tracking active Observer objects
  }

  /**
   * Register a new listener at service initialization
   * @param {Object} observer 
   */
  registerObserver(observer) {
    if (!observer || typeof observer.update !== 'function') {
      throw new Error('Invalid observer implementation: update method required');
    }
    this.observers.push(observer);
  }

  /**
   * Broadcast status change out to all decoupled observers
   */
  notifyObservers(request, oldStatus, newStatus) {
    for (const observer of this.observers) {
      // Pass context uniformly without accessing internal Service logic
      observer.update(request, oldStatus, newStatus);
    }
  }

  /**
   * Core request engine method handling staff workflow status transitions (FR-002)
   */
  async updateStatus(requestId, newStatus) {
    // 1. Fetch request from database inside a transactional boundary (ADR-DATA-001)
    // 2. Validate state machine transition safety rules 
    
    const request = { id: requestId, status: 'New' }; // Mock instance retrieval
    const oldStatus = request.status;
    request.status = newStatus; // Apply structural modification
    
    // 3. Synchronously broadcast status context out to listeners
    this.notifyObservers(request, oldStatus, newStatus);
    
    // 4. Commit database transaction safely
    return request;
  }
}
