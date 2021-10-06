import httpTrigger from "./index";
import { ContextMock, InvalidHttpRequestMock, HttpRequestMockPostUpdateLoGroup } from "../mock/azure.mock";
import { UpdateLoGroupService } from "./services/updateLoGroup";
import { ErrorService } from "../shared/services/errorHandling/error.service";

describe("Update LO Group index tests", () => {
    test("when input is empty", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
    });

    test("Happy Path", async () => {
        const spy = jest
            .spyOn(UpdateLoGroupService.prototype, "updateLoGroup")
            .mockImplementation(async () =>
                Promise.resolve({ data: "Successfully updated loan officer.", Error: false })
            );

        await httpTrigger(ContextMock, HttpRequestMockPostUpdateLoGroup);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body.data).toEqual("Successfully updated loan officer.");
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
