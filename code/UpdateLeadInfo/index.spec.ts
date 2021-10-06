import httpTrigger from "./index";
import {
    ContextMock,
    HttpRequestMockInvalidUpdtLeadInfo,
    HttpRequestMockValidUpdtLeadInfo,
    InvalidHttpRequestMock,
} from "../mock/azure.mock";
import { UpdateLeadInfoImpl } from "./Service/UpdateLeadInfoImpl.service";
import { ErrorService } from "../shared/services/errorHandling/error.service";

describe("Update LeadInfo Index", () => {
    test("If null object", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
    });

    test("when input is empty", async () => {
        await httpTrigger(ContextMock, HttpRequestMockInvalidUpdtLeadInfo);
        expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
    });

    test("Happy Path", async () => {
        const spy = jest
            .spyOn(UpdateLeadInfoImpl.prototype, "updateLeadInfo")
            .mockImplementation(async () => Promise.resolve({ data: "Data is updated", Error: false }));
        await httpTrigger(ContextMock, HttpRequestMockValidUpdtLeadInfo);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body.message).toEqual("Data is updated");
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
