import httpTrigger from "./index";
import { HttpRequestMockPost } from "./../mock/azure.mock";
import { ContextMock, InvalidHttpRequestMock } from "../mock/azure.mock";
import { SendToHomeBirdImpl } from "./service/SendToHomeBirdServiceImpl.service";

describe("HomeBird", () => {
    test("when input is empty", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body.data).toEqual(undefined);
    });

    test("Happy path", async () => {
        const request = {
            loEmail: "hannah.strachn@fairwaymc.com",
            loFirstName: "Test",
            leadId: "hns-1234",
        };
        const response = { Error: false, data: { success: true, leadId: "123456" } };
        const spy = jest
            .spyOn(SendToHomeBirdImpl.prototype, "sendToHomeBirdService")
            .mockImplementation(async () => Promise.resolve(response));
        const reqMock = { ...HttpRequestMockPost };
        reqMock.body = request;
        await httpTrigger(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
    });
});
