import httpTrigger from "./index";
import { CustomValidatorImpl } from "./../shared/validators/customValidatorImpl";
import { ContextMock, InvalidHttpRequestMock } from "../mock/azure.mock";
import { Relationships } from "./../shared/services/relationship/relationshipService";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { mockInvalidRequest } from "../mock/mockConstants";

describe("InviteUser", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    test("when input is empty", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body.data).toEqual(ErrorService.invalidRequest);
    });

    test("when invitee is not in fairway domain", async () => {
        const response = { Error: true, data: ["Invitee must be a Fairway user."] };
        const inviteUserSpy = jest.spyOn(Relationships.prototype, "inviteUser").mockReturnValue(null);
        const isValidUserSpy = jest
            .spyOn(CustomValidatorImpl.prototype, "isValidUser")
            .mockImplementationOnce(async () => Promise.resolve(true));
        const checkInviteeSpy = jest
            .spyOn(Relationships.prototype, "checkInvitee")
            .mockImplementationOnce(async () => Promise.resolve(null));

        const reqMock = { ...InvalidHttpRequestMock };
        // passing an invalid inviter
        reqMock.body = {
            inviter: "fftestuserCC1@fairwaymc.com",
            invitee: "sunit.kumarrr@ffairwaymc.com",
            role: "edit",
        };
        await httpTrigger(ContextMock, reqMock);

        expect(inviteUserSpy).toHaveBeenCalledTimes(0);
        expect(isValidUserSpy).toHaveBeenCalled();
        expect(checkInviteeSpy).toHaveBeenCalled();
        expect(ContextMock.res.body.data).toEqual(response.data);
        expect(ContextMock.res.body.Error).toBeTruthy();
    });

    test("when inviter is Invalid", async () => {
        const response = { Error: true, data: ["The inviter must be a valid user."] };
        const inviteUserSpy = jest.spyOn(Relationships.prototype, "inviteUser").mockReturnValue(null);
        const isValidUserSpy = jest
            .spyOn(CustomValidatorImpl.prototype, "isValidUser")
            .mockImplementationOnce(async () => Promise.resolve(false));
        const checkInviteeSpy = jest
            .spyOn(Relationships.prototype, "checkInvitee")
            .mockImplementationOnce(async () => Promise.resolve(null));

        const reqMock = { ...InvalidHttpRequestMock };
        reqMock.body = {
            inviter: "fftestuser11@fairwaymc.com",
            invitee: "sunit.kumar@fairwaymc.com",
            role: "edit",
        };
        await httpTrigger(ContextMock, reqMock);

        expect(inviteUserSpy).toHaveBeenCalledTimes(0);
        expect(isValidUserSpy).toHaveBeenCalled();
        expect(checkInviteeSpy).toHaveBeenCalled();
        expect(ContextMock.res.body.data).toEqual(response.data);
        expect(ContextMock.res.body.Error).toBeTruthy();
    });

    test("when invitee has already been invited", async () => {
        const response = { Error: true, data: ["User has already been invited."] };
        const inviteUserSpy = jest.spyOn(Relationships.prototype, "inviteUser").mockReturnValue(null);
        const isValidUserSpy = jest
            .spyOn(CustomValidatorImpl.prototype, "isValidUser")
            .mockImplementationOnce(async () => Promise.resolve(true));
        const checkInviteeSpy = jest
            .spyOn(Relationships.prototype, "checkInvitee")
            .mockImplementationOnce(async () => Promise.resolve(mockInvalidRequest));

        const reqMock = { ...InvalidHttpRequestMock };
        reqMock.body = {
            inviter: "fftestuser11@fairwaymc.com",
            invitee: "sunit.kumar@fairwaymc.com",
            role: "edit",
        };
        await httpTrigger(ContextMock, reqMock);

        expect(inviteUserSpy).toHaveBeenCalledTimes(0);
        expect(isValidUserSpy).toHaveBeenCalled();
        expect(checkInviteeSpy).toHaveBeenCalled();
        expect(ContextMock.res.body.data).toEqual(response.data);
        expect(ContextMock.res.body.Error).toBeTruthy();
    });

    test("Happy Path", async () => {
        const response = { data: "Successfully added new user to the account.", Error: false };
        const spy = jest
            .spyOn(Relationships.prototype, "inviteUser")
            .mockImplementationOnce(async () => Promise.resolve(response));
        const isValidUserSpy = jest
            .spyOn(CustomValidatorImpl.prototype, "isValidUser")
            .mockImplementationOnce(async () => Promise.resolve(true));
        const checkInviteeSpy = jest
            .spyOn(Relationships.prototype, "checkInvitee")
            .mockImplementationOnce(async () => Promise.resolve(null));

        const reqMock = { ...InvalidHttpRequestMock };
        reqMock.body = {
            inviter: "fftestuser1@fairwaymc.com",
            invitee: "sunit.kumar@fairwaymc.com",
            role: "edit",
        };
        await httpTrigger(ContextMock, reqMock);

        expect(spy).toHaveBeenCalled();
        expect(isValidUserSpy).toHaveBeenCalled();
        expect(checkInviteeSpy).toHaveBeenCalled();
        expect(ContextMock.res.body.data).toEqual(response.data);
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
