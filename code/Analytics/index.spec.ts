import { ErrorService } from "./../shared/services/errorHandling/error.service";
import httpTrigger from "./index";
import { ContextMock, HttpRequestMock } from "../mock/azure.mock";
import { AnalyticsServiceImpl } from "./Service/AnalyticsImpl.service";

describe("Get Analytics", () => {
    test("when input is empty", async () => {
        await httpTrigger(ContextMock, HttpRequestMock);
        expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
    });

    test("Happy Path", async () => {
        const request = {
            loEmail: "hannah.strachn@fairwaymc.com",
            frequency: "day",
            minDate: "2021-01-01",
            maxDate: "2021-01-31",
        };
        const response = {
            data: {
                "2021-01-01": {
                    created: {
                        t: 2,
                        src: {
                            Zillow: 1,
                            Fairway: 1,
                        },
                    },
                },
            },
            Error: false,
        };
        const spy = jest
            .spyOn(AnalyticsServiceImpl.prototype, "getAnalytics")
            .mockImplementation(() => Promise.resolve(response));
        const reqMock = { ...HttpRequestMock };
        reqMock.query = request;
        await httpTrigger(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
