export class AxiosErrorResponseMock extends Error {
    private readonly response: unknown;
    private readonly request: unknown;
    private readonly isAxiosError: boolean;

    constructor(name?: string, message?: string, request?: unknown, response?: unknown) {
        super(message);
        this.name = name;
        this.message = message;
        Object.setPrototypeOf(this, new.target.prototype);
        this.request = request;
        this.response = response;
        this.isAxiosError = true;
    }
}
