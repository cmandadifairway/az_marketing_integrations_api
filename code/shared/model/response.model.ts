export class ResponseModel {
    private responseHeader: Object;
    private responseBody: string;
    private responseStatus: number;

    public getResponseHeader(): Object {
        return this.responseHeader;
    }

    public setResponseHeader(responseHeader: Object): void {
        this.responseHeader = responseHeader;
    }

    getResponseBody(): string {
        return this.responseBody;
    }
    getResponseStatus(): number {
        return this.responseStatus;
    }

    setResponseBody(responseBody: string): void {
        this.responseBody = responseBody;
    }
    setResponseStatus(responseStatus: number): void {
        this.responseStatus = responseStatus;
    }
}
