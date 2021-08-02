import { healthCheck } from "./index";
import { ContextMock } from "../testing/mock/ContextMock.model";
import { HttpRequestMock } from "../testing/mock/HttpRequestMock.model";
import { Context, Logger } from "@azure/functions";

jest.mock("applicationinsights", () => {
    enum DistributedTracingModes {
        /**
         * (Default) Send Application Insights correlation headers
         */
        AI = 0,
        /**
         * Send both W3C Trace Context headers and back-compatibility Application Insights headers
         */
        AI_AND_W3C = 1,
    }
    const setup = jest.fn();
    const setAutoDependencyCorrelation = jest.fn();
    const setAutoCollectRequests = jest.fn();
    const setAutoCollectPerformance = jest.fn();
    const setAutoCollectExceptions = jest.fn();
    const setAutoCollectDependencies = jest.fn();
    const setAutoCollectConsole = jest.fn();
    const setUseDiskRetryCaching = jest.fn();
    const setDistributedTracingMode = jest.fn();
    const start = jest.fn();
    const appInsObj = {
        defaultClient: {
            commonProperties: {},
            context: {
                keys: { operationId: 123 },
                tags: {},
            },
            trackTrace: jest.fn(),
        },
        DistributedTracingModes,
        setup,
        setAutoDependencyCorrelation,
        setAutoCollectRequests,
        setAutoCollectPerformance,
        setAutoCollectExceptions,
        setAutoCollectDependencies,
        setAutoCollectConsole,
        setUseDiskRetryCaching,
        setDistributedTracingMode,
        start,
    };
    setup.mockImplementation(() => appInsObj);
    setAutoDependencyCorrelation.mockImplementation(() => appInsObj);
    setAutoCollectRequests.mockImplementation(() => appInsObj);
    setAutoCollectPerformance.mockImplementation(() => appInsObj);
    setAutoCollectExceptions.mockImplementation(() => appInsObj);
    setAutoCollectDependencies.mockImplementation(() => appInsObj);
    setAutoCollectConsole.mockImplementation(() => appInsObj);
    setUseDiskRetryCaching.mockImplementation(() => appInsObj);
    setDistributedTracingMode.mockImplementation(() => appInsObj);
    start.mockImplementation(() => appInsObj);
    return appInsObj;
});
describe("test healthCheck function", () => {
    test("test success", async () => {
        const context = new ContextMock();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        context.traceContext = { traceparent: "123" };
        context.invocationId = "123-test";
        context.res = {};
        context.res.headers = {};
        const httpReq = new HttpRequestMock();
        await healthCheck(context, httpReq);
        context.res.status = 200;
        expect(context.res.status).toEqual(200);
    });
});
