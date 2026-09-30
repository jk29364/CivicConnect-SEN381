/**
 * Interface boundary enforcing uniform signatures on all system observers.
 */
export interface Observer {
  /**
   * Called synchronously by the Subject whenever a state change occurs.
   */
  update(request: any, oldStatus: string, newStatus: string): void;
}
