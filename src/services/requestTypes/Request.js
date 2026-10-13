//Base model providing initial structural guarantees (FR-001 & FR-011)
//subclasses will implement validate()

export class Request {
    constructor(payload) {
        this.id = Math.random().toString(36).slice(2, 11); //this is a mock ID, it will be replaced by DB-generated references (FR-010)
        this.category = payload.category;
        this.description = payload.description;
        this.location = payload.location;
        this.submittedBy = payload.submittedBy;
        this.severity = payload.severity || 'Low';
        this.status = 'New';
        this.createdAt = new Date();
    }

    validate() {
        throw new Error('validate() must be implemented by subclasses');
    }
}