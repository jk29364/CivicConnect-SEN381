/**
 * Base abstract model layout providing initial structural layout guarantees (FR-001/FR-011)
 */
export abstract class Request {
  id: string;
  category: string;
  description: string;
  location: string;
  severity: "Low" | "Medium" | "High";
  submittedBy: string;
  status: "New" | "Assigned" | "InProgress" | "Resolved" | "Closed";
  createdAt: Date;

  constructor(payload: any) {
    this.id = Math.random().toString(36).substr(2, 9); // Mock structural ID generation
    this.category = payload.category;
    this.description = payload.description;
    this.location = payload.location;
    this.submittedBy = payload.submittedBy;
    
    // FR-011: Severity flag defaults to "Low" unless explicitly provided
    this.severity = payload.severity || "Low"; 
    this.status = "New"; // Baseline initialization status parameter
    this.createdAt = new Date();
  }

  /**
   * Abstract validation definition hook required for subclass implementations
   */
  abstract validate(): boolean;
}
