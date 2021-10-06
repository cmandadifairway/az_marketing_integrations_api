import { ErrorService } from "./../shared/services/errorHandling/error.service";
import httpTrigger from "./index";
import { Relationships } from "./../shared/services/relationship/relationshipService";
import { ContextMock, HttpRequestMock } from "../mock/azure.mock";

describe("Account Privileges", () => {
    test("when input is empty", async () => {
        await httpTrigger(ContextMock, HttpRequestMock);
        expect(ContextMock.res.body).toEqual(ErrorService.genericError);
    });

    test("Happy Path", async () => {
        const response = { data: [{ name: "read", desc: "read access" }], Error: false };
        const spy = jest
            .spyOn(Relationships.prototype, "getAccountPrivileges")
            .mockImplementation(() => Promise.resolve(response));
        await httpTrigger(ContextMock, HttpRequestMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
