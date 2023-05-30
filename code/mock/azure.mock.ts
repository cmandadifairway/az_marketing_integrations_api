import { Context, HttpRequest } from "@azure/functions";

const logger = (d: any) => d;
logger.info = jest.fn();
logger.error = jest.fn();
logger.warn = jest.fn();
logger.verbose = jest.fn();

//Update  Context model for test cases
export const ContextMock: Context = {
    invocationId: null,
    log: logger,
    done: jest.fn(),
    res: null,
    bindingData: null,
    bindingDefinitions: null,
    bindings: null,
    executionContext: null,
    traceContext: null,
};

export const HttpRequestMock: HttpRequest = {
    method: "GET",
    headers: null,
    params: null,
    query: null,
    url: null,
};

export const InvalidHttpRequestMock: HttpRequest = {
    method: "POST",
    headers: null,
    params: null,
    query: null,
    url: null,
    body: null,
};

export const HttpRequestMockPost: HttpRequest = {
    method: "POST",
    headers: null,
    params: null,
    query: null,
    url: null,
    body: { id: "" },
};

export const HttpRequestMockPostwithID: HttpRequest = {
    method: "POST",
    headers: null,
    params: null,
    query: null,
    url: null,
    body: { id: "12355" },
};

export const HttpRequestMockGet: HttpRequest = {
    method: "GET",
    headers: null,
    params: null,
    query: { loEmail: "testuser@testuser.com" },
    url: null,
    body: null,
};

export const HttpRequestMockHealthCheck: HttpRequest = {
    method: "GET",
    headers: null,
    params: null,
    query: null,
    url: null,
    body: null,
};
