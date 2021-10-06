import { ErrorService } from "./../shared/services/errorHandling/error.service";
import httpTrigger from "./index";
import { Banners } from "./../shared/services/banner/bannerService";
import { ContextMock, HttpRequestMock, HttpRequestMockGet } from "../mock/azure.mock";

describe("Get Banners", () => {
    test("when input is empty", async () => {
        await httpTrigger(ContextMock, HttpRequestMock);
        expect(ContextMock.res.body).toEqual(ErrorService.genericError);
    });

    test("Happy Path - When querystring mobile=true", async () => {
        const response = {
            data: {
                _id: "611414ff06a21711c8e3df27",
                expirationDate: "3000-12-31T23:59:59.999Z",
                bannerMessage: "test no expiration date",
                viewLimit: 10000,
                bannerUrl: "www.google.com",
            },
            Error: false,
        };
        const spy = jest.spyOn(Banners.prototype, "getBanners").mockImplementation(() => Promise.resolve(response));
        const reqMock = { ...HttpRequestMockGet };
        reqMock.query = { mobile: "true" };
        await httpTrigger(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
        expect(ContextMock.res.body.Error).toBeFalsy();
    });

    test("Happy Path - When querystring mobile=false or not provided", async () => {
        const response = {
            data: [
                {
                    _id: "611414ff06a21711c8e3df27",
                    expirationDate: "3000-12-31T23:59:59.999Z",
                    bannerMessage: "test no expiration date",
                    viewLimit: 10000,
                    bannerUrl: "www.google.com",
                },
            ],
            Error: false,
        };
        const spy = jest.spyOn(Banners.prototype, "getBanners").mockImplementation(() => Promise.resolve(response));
        await httpTrigger(ContextMock, HttpRequestMockGet);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
