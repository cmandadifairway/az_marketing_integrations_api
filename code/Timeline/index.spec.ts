import httpTrigger from "./index";
import { ContextMock } from "../mock/azure.mock";
import { TimelineImpl } from "./service/TimelineSerivceImpl.service";
import { TimelineResponse } from "./model/timelineResponse";
import { HttpRequest } from "@azure/functions";

describe("Timeline Index", () => {
    test("Test for result if error in service module of dashboard", async () => {
        const mockHttpRequest: HttpRequest = {
            method: "GET",
            headers: null,
            params: null,
            query: {
                loEmail: "testuser@testuser.com",
                minDate: "2021-08-01",
                maxDate: "2021-08-07",
            },
            url: null,
            body: null,
        };
        const response: TimelineResponse = { data: [], Error: false };
        const spy = jest
            .spyOn(TimelineImpl.prototype, "getTimelineService")
            .mockImplementation(async () => Promise.resolve(response));
        await httpTrigger(ContextMock, mockHttpRequest);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body.data).toStrictEqual([]);
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
