import httpTrigger from "./index";
import { ContextMock, HttpRequestMockInvalidLeads, HttpRequestMockGet } from "../mock/azure.mock";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { LeadsFilterOptionsServiceImpl } from "./Service/LeadsFilterOptions.service";

describe("LeadsFilterOptions", () => {
    test("If LO Email is emtpy string", async () => {
        await httpTrigger(ContextMock, HttpRequestMockInvalidLeads);
        expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
    });

    test("Happy Path", async () => {
        const response = {
            data: {
                leadStatus: ["Lead Created", "Qualified Lead", "Unqualified Lead"],
                loanType: ["mortgage"],
                loanSource: ["Realtor.com Remnant", "Manual Lead", "Zillow Remnant"],
                leadState: ["IL", "WA", "MS", "TX"],
            },
            Error: false,
        };
        const spy = jest
            .spyOn(LeadsFilterOptionsServiceImpl.prototype, "getAllFilterOptions")
            .mockImplementation(async () => Promise.resolve(response));
        const reqMock = { ...HttpRequestMockGet };
        reqMock.query = { loEmail: "fftestuser1@fairwaymc.com" };
        await httpTrigger(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
