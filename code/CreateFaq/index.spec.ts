import httpTrigger from "./index";
import { HelpFaq } from "./../shared/service/helpFaq/helpFaqService";
import { HttpRequestMockPost } from "./../mock/azure.mock";
import { ContextMock, InvalidHttpRequestMock } from "../mock/azure.mock";
import { AppInsightsService } from "../shared/service/monitoring/applicationInsights";

describe("Create Faq", () => {
    beforeAll(() => {
        jest.spyOn(AppInsightsService.prototype, "startService").mockImplementation(async () => Promise.resolve());
    });

    test("when input is empty", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body.data).toEqual(undefined);
    });

    test("Happy path", async () => {
        const request = {
            question: "Test?",
            answer: "You can email us directly at FairwayFirst@fairwaymc.com",
            answerType: "text",
            active: true,
            category: "general",
            orderBy: 10,
        };
        const response = { Error: false, data: "Successfully inserted faq." };
        const spy = jest
            .spyOn(HelpFaq.prototype, "createFaq")
            .mockImplementation(async () => Promise.resolve(response));
        const reqMock = { ...HttpRequestMockPost };
        reqMock.body = request;
        await httpTrigger(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
    });
});
