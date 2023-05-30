export class BaseError extends Error {
    private description: unknown;
    private statusCode: number;
    private requestId: string;
    private readonly errorMessage: string;

    constructor(error: Error, name?: string, statusCode?: number, message?: string, requestId?: string, description?: unknown) {
        if (!message) {
            message = error.message;
        }
        super(message);
        this.name = name;
        this.message = message;
        this.errorMessage = message;
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.description = description;
        this.requestId = requestId;
        try {
            Error.captureStackTrace(error, BaseError);
        } catch (err) {
            console.log(`something went wrong while captureStackTrace ${err}`);
        }
    }
    getMessage(): string {
        return this.message;
    }
    getDescription(): unknown {
        return this.description;
    }

    setMessage(errorMessage: string): void {
        this.message = errorMessage;
    }
    setDescription(errorDescription: unknown): void {
        this.description = errorDescription;
    }
    getStatusCode(): number {
        return this.statusCode;
    }
    setStatusCode(statusCode: number): void {
        this.statusCode = statusCode;
    }
    getRequestId(): string {
        return this.requestId;
    }
    setRequestId(requestId: string): void {
        this.requestId = requestId;
    }
}
