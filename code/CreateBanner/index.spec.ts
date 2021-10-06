import httpTrigger from "./index";
import { HttpRequestMockPost } from "./../mock/azure.mock";
import { Banners } from "./../shared/service/banner/bannerService";
import { ContextMock, InvalidHttpRequestMock } from "../mock/azure.mock";
import { AppInsightsService } from "../shared/service/monitoring/applicationInsights";

describe("Create Banner", () => {
    beforeAll(() => {
        jest.spyOn(AppInsightsService.prototype, "startService").mockImplementation(async () => Promise.resolve());
    });

    test("when input is empty", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body.data).toEqual(undefined);
    });

    test("Happy path", async () => {
        const request = {
            message: "This is the sample banner 1",
            url: "tbd.com",
            active: true,
            viewLimit: 1000,
            expirationDate: "2022-07-23T14:00:00.000Z",
            username: "cmandadi",
        };
        const response = { Error: false, data: "Successfully inserted banner." };
        const spy = jest
            .spyOn(Banners.prototype, "createBanner")
            .mockImplementation(async () => Promise.resolve(response));
        const reqMock = { ...HttpRequestMockPost };
        reqMock.body = request;
        await httpTrigger(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
    });
});
