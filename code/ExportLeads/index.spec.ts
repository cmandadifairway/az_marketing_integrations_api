import { ErrorService } from "./../shared/services/errorHandling/error.service";
import { HttpRequestMockGet } from "./../mock/azure.mock";
import httpTrigger from "./index";
import { ContextMock, InvalidHttpRequestMock } from "../mock/azure.mock";
import { ExportLeadsServiceImpl } from "./Service/ExportLeadsImpl.service";
import { CustomValidatorImpl } from "../shared/validators/customValidatorImpl";

describe("Export Leads", () => {
    test("when input is empty", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body).toEqual(ErrorService.genericError);
    });

    test("Happy Path", async () => {
        const response = { data: "Request received successfully", Error: false };
        const isValidUserSpy = jest
            .spyOn(CustomValidatorImpl.prototype, "isValidUser")
            .mockImplementationOnce(async () => Promise.resolve(true));

        const spy = jest
            .spyOn(ExportLeadsServiceImpl.prototype, "exportLeads")
            .mockImplementation(async () => Promise.resolve());
        const reqMock = { ...HttpRequestMockGet };
        reqMock.query = { loEmail: "fftestuser1@fairwaymc.com" };
        await httpTrigger(ContextMock, reqMock);
        expect(isValidUserSpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
    });
});
