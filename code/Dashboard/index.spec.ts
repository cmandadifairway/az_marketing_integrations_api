import httpTrigger from "./index";
import { ContextMock, HttpRequestMock, HttpRequestMockGet } from "../mock/azure.mock";
import { GetDashBoardImpl } from "./Service/GetDashBoardImpl.service";
import { ErrorService } from "../shared/services/errorHandling/error.service";

describe("Dashboard Index", () => {
    test("If invalid request sent to index", async () => {
        await httpTrigger(ContextMock, HttpRequestMock);
        expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
        expect(ContextMock.res.body.Error).toBeUndefined();
    });

    test("If error occurs in service", async () => {
        jest.spyOn(GetDashBoardImpl.prototype, "getDashBoardInfo").mockImplementation(async () => {
            throw new Error("Error in service");
        });
        await httpTrigger(ContextMock, HttpRequestMockGet);
        expect(ContextMock.res.body.data).toEqual("An error has occurred, please check log for details.");
        expect(ContextMock.res.body.Error).toBeTruthy();
    });
});
