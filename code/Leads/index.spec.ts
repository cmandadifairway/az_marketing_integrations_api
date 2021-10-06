import httpTrigger from "./index";
import { ContextMock, HttpRequestMockValidLeads, HttpRequestMockInvalidLeads } from "../mock/azure.mock";
import { LeadsServiceImpl } from "./Service/LeadsImpl.service";
import { ErrorService } from "../shared/services/errorHandling/error.service";

describe("Leads Index", () => {
    test("If LO Email is emtpy string", async () => {
        await httpTrigger(ContextMock, HttpRequestMockInvalidLeads);
        expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
    });

    test("Happy Path", async () => {
        const response = { leads: undefined, Error: false };
        const spy = jest
            .spyOn(LeadsServiceImpl.prototype, "getAllLeadsForDisplay")
            .mockImplementation(async () => Promise.resolve(response));
        await httpTrigger(ContextMock, HttpRequestMockValidLeads);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
