import { Context, HttpRequest } from "@azure/functions";

const logger = (d) => d;
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

//Update HttpReq obj to pass data for test cases
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

export const HttpRequestMockGetWithoutEmail = {
    method: "GET",
    headers: null,
    params: null,
    url: "/api/dashboard",
    body: null,
};

export const HttpRequestMockInvalidLeads: HttpRequest = {
    method: "POST",
    headers: null,
    params: null,
    query: null,
    url: null,
    body: { loEmail: "" },
};

export const HttpRequestMockValidLeads: HttpRequest = {
    method: "POST",
    headers: null,
    params: null,
    query: null,
    url: null,
    body: { loEmail: "testUser@test.com" },
};

export const HttpRequestMockInvalidUpdtLeadInfo: HttpRequest = {
    method: "POST",
    headers: null,
    params: null,
    query: null,
    url: null,
    body: {},
};
export const HttpRequestMockValidUpdtLeadInfo: HttpRequest = {
    method: "POST",
    headers: null,
    params: null,
    query: null,
    url: null,
    body: { id: "12355" },
};

export const HttpRequestMockHealthCheck: HttpRequest = {
    method: "GET",
    headers: null,
    params: null,
    query: null,
    url: null,
    body: null,
};

export const HttpRequestMockSendEmail: HttpRequest = {
    method: "POST",
    headers: null,
    params: null,
    query: null,
    url: null,
    body: {
        from: "no-reply@fairwaymc.com",
        to: ["chandra.mandadi@fairwaymc.com"],
        subject: "test",
        text: "",
        html: "<html>This is test</html>",
        attachments: [],
    },
};

export const HttpRequestMockPostUpdateLoGroup: HttpRequest = {
    method: "POST",
    headers: null,
    params: null,
    query: null,
    url: null,
    body: { action: "remove", groupType: "primary", groupId: "State-TX", loEmail: "test@email.com" },
};
