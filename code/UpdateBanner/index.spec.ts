import { updateBanner } from "./index";
import { Banners } from "./../shared/service/banner/bannerService";
import { ContextMock, InvalidHttpRequestMock, HttpRequestMockPostwithID } from "../mock/azure.mock";
import { ErrorService } from "../shared/service/errorHandling/error.service";
import { AppInsightsService } from "../shared/service/monitoring/applicationInsights";

describe("Update Banner", () => {
    beforeAll(() => {
        jest.spyOn(AppInsightsService.prototype, "setupProperties").mockImplementation(async () => Promise.resolve());
    });

    test("when input is empty", async () => {
        await updateBanner(ContextMock, InvalidHttpRequestMock);
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
        await updateBanner(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
    });
});
