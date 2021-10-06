import httpTrigger from "./index";
import { ContextMock, HttpRequestMockHealthCheck } from "../mock/azure.mock";

describe("Health Check", () => {
    test("If LO Email is emtpy string", async () => {
        await httpTrigger(ContextMock, HttpRequestMockHealthCheck);
        expect(ContextMock.res.body).toEqual("I am Awake.");
    });
});
