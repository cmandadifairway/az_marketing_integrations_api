import httpTrigger from "./index";
import { CustomValidatorImpl } from "./../shared/validators/customValidatorImpl";
import { ContextMock, InvalidHttpRequestMock } from "../mock/azure.mock";
import { Relationships } from "./../shared/services/relationship/relationshipService";
import { ErrorService } from "../shared/services/errorHandling/error.service";

describe("RemoveInvitedUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("when input is empty", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body.data).toEqual(ErrorService.invalidRequest);
    });

    test("when inviter is Invalid", async () => {
        const response = { Error: true, data: ["The inviter must be a valid user."] };
        const removeUserSpy = jest.spyOn(Relationships.prototype, "removeInvitedUser").mockReturnValue(null);
        const isValidUserSpy = jest
            .spyOn(CustomValidatorImpl.prototype, "isValidUser")
            .mockImplementationOnce(async () => Promise.resolve(false));
        const checkInviteeSpy = jest
            .spyOn(Relationships.prototype, "checkInvitee")
            .mockImplementationOnce(async () => Promise.resolve(response));

        const reqMock = { ...InvalidHttpRequestMock };
        reqMock.body = {
            inviter: "fftestuserCC1@fairwaymc.com",
            invitee: "sunit.kumar@fairwaymc.com",
        };
        await httpTrigger(ContextMock, reqMock);

        expect(removeUserSpy).toHaveBeenCalledTimes(0);
        expect(isValidUserSpy).toHaveBeenCalled();
        expect(checkInviteeSpy).toHaveBeenCalled();
        expect(ContextMock.res.body.data).toEqual(response.data);
        expect(ContextMock.res.body.Error).toBeTruthy();
    });

    test("when invitee has not been invited yet", async () => {
        const response = { Error: true, data: ["Invitee does not exist."] };
        const removeUserSpy = jest.spyOn(Relationships.prototype, "removeInvitedUser").mockReturnValue(null);
        const isValidUserSpy = jest
            .spyOn(CustomValidatorImpl.prototype, "isValidUser")
            .mockImplementationOnce(async () => Promise.resolve(true));
        const checkInviteeSpy = jest.spyOn(Relationships.prototype, "checkInvitee").mockReturnValue(null);

        const reqMock = { ...InvalidHttpRequestMock };
        reqMock.body = {
            inviter: "fftestuser11@fairwaymc.com",
            invitee: "sunit.kumar@fairwaymc.com",
        };
        await httpTrigger(ContextMock, reqMock);

        expect(removeUserSpy).toHaveBeenCalledTimes(0);
        expect(isValidUserSpy).toHaveBeenCalled();
        expect(checkInviteeSpy).toHaveBeenCalled();
        expect(ContextMock.res.body.data).toEqual(response.data);
        expect(ContextMock.res.body.Error).toBeTruthy();
    });

    test("Happy Path", async () => {
        const response = { data: "Successfully removed user from the account.", Error: false };
        const spy = jest
            .spyOn(Relationships.prototype, "removeInvitedUser")
            .mockImplementationOnce(async () => Promise.resolve(response));
        const isValidUserSpy = jest
            .spyOn(CustomValidatorImpl.prototype, "isValidUser")
            .mockImplementationOnce(async () => Promise.resolve(true));
        const checkInviteeSpy = jest
            .spyOn(Relationships.prototype, "checkInvitee")
            .mockImplementationOnce(async () => Promise.resolve(response));

        const reqMock = { ...InvalidHttpRequestMock };
        reqMock.body = {
            inviter: "fftestuser1@fairwaymc.com",
            invitee: "sunit.kumar@fairwaymc.com",
        };
        await httpTrigger(ContextMock, reqMock);

        expect(spy).toHaveBeenCalled();
        expect(isValidUserSpy).toHaveBeenCalled();
        expect(checkInviteeSpy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
    });
});
