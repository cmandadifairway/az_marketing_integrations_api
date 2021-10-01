import httpTrigger from "./index";
import { ContextMock, InvalidHttpRequestMock, HttpRequestMockPostUpdateLoGroup } from "../mock/azure.mock";
import { UpdateLoGroupService } from "./service/updateLoGroup";
import { ErrorService } from "../shared/service/errorHandling/error.service";
import { AppInsightsService } from "../shared/service/monitoring/applicationInsights";

describe("Update LO Group index tests", () => {
    beforeAll(() => {
        jest.spyOn(AppInsightsService.prototype, "startService").mockImplementation(async () => Promise.resolve());
    });

    test("when input is empty", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
    });

    test("Happy Path", async () => {
        const spy = jest.spyOn(UpdateLoGroupService.prototype, "updateLoGroup").mockImplementation(async () =>
            Promise.resolve({
                data: "Successfully updated loan officer.",
                Error: false,
            })
        );

        await httpTrigger(ContextMock, HttpRequestMockPostUpdateLoGroup);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body.data).toEqual("Successfully updated loan officer.");
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
