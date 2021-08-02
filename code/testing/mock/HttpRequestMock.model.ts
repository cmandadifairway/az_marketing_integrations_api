import { HttpRequest } from "@azure/functions";

export class HttpRequestMock implements HttpRequest {
    method;
    url: string;
    headers: { [key: string]: string };
    query: { [key: string]: string };
    params: { [key: string]: string };
    body?: any;
    rawBody?: any;
}
