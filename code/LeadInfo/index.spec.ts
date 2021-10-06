import httpTrigger from "./index";
import { GetLeadServiceImpl } from "./service/GetLeadServiceImpl.service";
import { ContextMock, HttpRequestMockPost, HttpRequestMockPostwithID } from "../mock/azure.mock";
import { ErrorService } from "../shared/services/errorHandling/error.service";

test("Test for Id exists", async () => {
    await httpTrigger(ContextMock, HttpRequestMockPost);
    expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
});

test("error returned by the leadsInfo Service class", async () => {
    jest.spyOn(GetLeadServiceImpl.prototype, "getLeadInfo").mockImplementation(async () =>
        Promise.resolve({
            data: null,
            Error: true,
        })
    );
    await httpTrigger(ContextMock, HttpRequestMockPostwithID);
    expect(ContextMock.res.body.data).toEqual(null);
    expect(ContextMock.res.body.Error).toBeTruthy();
});
