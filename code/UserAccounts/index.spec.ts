import httpTrigger from "./index";
import { Relationships } from "./../shared/services/relationship/relationshipService";
import { ContextMock, HttpRequestMockGet } from "../mock/azure.mock";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { mockInvalidRequest } from "../mock/mockConstants";

describe("UserAccounts", () => {
    test("when input is empty", async () => {
        await httpTrigger(ContextMock, HttpRequestMockGet);
        expect(ContextMock.res.body).toEqual(ErrorService.genericError);
    });

    test("when input parameters are Invalid", async () => {
        const spy = jest
            .spyOn(Relationships.prototype, "getAccounts")
            .mockImplementation(() => Promise.resolve(mockInvalidRequest));
        const reqMock = { ...HttpRequestMockGet };
        // email id is invalid here, missing .com
        reqMock.query = {
            loEmail: "fftestuser1@fairwaymc",
        };
        await httpTrigger(ContextMock, reqMock);
        expect(spy).toHaveBeenCalledTimes(0);
        expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
    });

    test("Happy Path", async () => {
        const response = {
            data: [
                {
                    loEmail: "chandra.mandadi@fairwaymc.com",
                    name: "Chandra Mandadi",
                    role: "read",
                },
                {
                    loEmail: "hannah.strachn@fairwaymc.com",
                    name: "Hannah Strachn",
                    role: "edit",
                },
            ],
            Error: false,
        };
        const spy = jest
            .spyOn(Relationships.prototype, "getAccounts")
            .mockImplementation(() => Promise.resolve(response));
        const reqMock = { ...HttpRequestMockGet };
        reqMock.query = {
            loEmail: "fftestuser1@fairwaymc.com",
        };
        await httpTrigger(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
    });
});
