import "reflect-metadata";
import container from "../../inversify.config";
import { TYPES } from "../inversify/types";
import { UtilityService } from "./utility.service";
import axios from "axios";
import { AxiosError } from "../model/axiosError.model";
import { CustomLoggerImpl } from "./customLoggerImpl.service";

jest.mock("applicationinsights", () => {
    const setup = jest.fn();
    const setAutoDependencyCorrelation = jest.fn();
    const setAutoCollectRequests = jest.fn();
    const setAutoCollectPerformance = jest.fn();
    const setAutoCollectExceptions = jest.fn();
    const setAutoCollectDependencies = jest.fn();
    const setAutoCollectConsole = jest.fn();
    const setUseDiskRetryCaching = jest.fn();
    const start = jest.fn();
    const appInsObj = {
        defaultClient: {
            commonProperties: {},
            context: {
                keys: { operationId: 123 },
                tags: {},
            },
            trackTrace: jest.fn(),
            trackDependency: jest.fn(),
        },
        setup,
        setAutoDependencyCorrelation,
        setAutoCollectRequests,
        setAutoCollectPerformance,
        setAutoCollectExceptions,
        setAutoCollectDependencies,
        setAutoCollectConsole,
        setUseDiskRetryCaching,
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
    start.mockImplementation(() => appInsObj);
    return appInsObj;
});

describe("test getBoolean Method", () => {
    test("getBoolean for invalid value", async () => {
        const utilityService = new UtilityService();
        const value = utilityService.getBoolean("testMe");
        expect(value).toBeFalsy;
    });
    test("getBoolean for  value", async () => {
        const utilityService = new UtilityService();
        const value = utilityService.getBoolean("true");
        expect(value).toBeFalsy;
    });
    test("getBoolean for  value", async () => {
        const utilityService = new UtilityService();
        const value = utilityService.getBoolean("y");
        expect(value).toBeFalsy;
    });
    test("getBoolean for  value", async () => {
        const utilityService = new UtilityService();
        const value = utilityService.getBoolean("yes");
        expect(value).toBeFalsy;
    });
    test("getBoolean for  value", async () => {
        const utilityService = new UtilityService();
        const value = utilityService.getBoolean("Y");
        expect(value).toBeFalsy;
    });
});

describe(" Test axiosCall Method", () => {
    jest.spyOn(CustomLoggerImpl.prototype, "error").mockImplementation(() => Promise.resolve());
    jest.spyOn(CustomLoggerImpl.prototype, "trace").mockImplementation(() => jest.fn());
    jest.spyOn(CustomLoggerImpl.prototype, "info").mockImplementation(() => jest.fn());
    test("test success flow post call ", async () => {
        jest.spyOn(axios, "post").mockResolvedValue({ test: "test" });
        const utilityService = new UtilityService();
        const response = await utilityService.axiosCall(
            "test.com",
            "post",
            { Authorization: "Bearer 0007DGuPiqvWJhPcxthtjgWw9che" },
            { test: "test" }
        );
        expect(response).toBeDefined;
    });
    test("test success flow get call", async () => {
        jest.spyOn(axios, "get").mockResolvedValue({ test: "test" });
        const utilityService = new UtilityService();
        const response = await utilityService.axiosCall("test.com", "get", {
            Authorization: "Bearer 0007DGuPiqvWJhPcxthtjgWw9che",
        });
        expect(response).toBeDefined;
    });
    test("test error return ApplicationError ", async () => {
        jest.spyOn(axios, "post").mockRejectedValue("Network error: Something went wrong");
        const utilityService = new UtilityService();
        try {
            await utilityService.axiosCall("test.com", "post", null);
        } catch (error) {
            expect(error).toBeInstanceOf(AxiosError);
        }
    });
    test("test error flow", async () => {
        jest.spyOn(axios, "post").mockRejectedValue("Network error: Something went wrong");
        const utilityService = new UtilityService();
        try {
            await utilityService.axiosCall("test.com", "post", null);
        } catch (error) {
            expect(error.name).toEqual("INTEGRATION_ERROR");
        }
    });
});
