import httpTrigger from "./index";
import { Banners } from "./../shared/services/banner/bannerService";
import { ContextMock, InvalidHttpRequestMock, HttpRequestMockPostwithID } from "../mock/azure.mock";
import { ErrorService } from "../shared/services/errorHandling/error.service";

describe("Update Banner", () => {
    test("when input is empty", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
    });

    test("Happy Path", async () => {
        const response = { data: "Successfully updated banner.", Error: false };
        const spy = jest
            .spyOn(Banners.prototype, "updateBanner")
            .mockImplementation(async () => Promise.resolve(response));

        const reqMock = { ...HttpRequestMockPostwithID };
        reqMock.body = {
            id: "60faffa39b4f5576282fab0b",
            message: "updating sample banner",
            url: "tbd.com",
            active: true,
            viewLimit: 100,
            expirationDate: "2024-07-23T14:00:00.000Z",
            username: "cmandadi",
        };
        await httpTrigger(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
    });
});
