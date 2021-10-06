import httpTrigger from "./index";
import { ContextMock, InvalidHttpRequestMock, HttpRequestMockPostwithID } from "../mock/azure.mock";
import { HelpFaq } from "../shared/services/helpFaq/helpFaqService";
import { ErrorService } from "../shared/services/errorHandling/error.service";

describe("Update Faq Index", () => {
    test("when input is empty", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body).toEqual(ErrorService.invalidRequest);
    });

    test("Happy Path", async () => {
        const spy = jest
            .spyOn(HelpFaq.prototype, "updateFaq")
            .mockImplementation(async () => Promise.resolve({ data: "Data is updated", Error: false }));
        HttpRequestMockPostwithID.body["question"] = "Test?";
        HttpRequestMockPostwithID.body["answer"] = "Test answer";
        HttpRequestMockPostwithID.body["answerType"] = "text";
        HttpRequestMockPostwithID.body["active"] = false;
        HttpRequestMockPostwithID.body["category"] = "test";
        HttpRequestMockPostwithID.body["orderBy"] = 10;
        await httpTrigger(ContextMock, HttpRequestMockPostwithID);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body.data).toEqual("Data is updated");
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
