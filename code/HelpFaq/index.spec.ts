import httpTrigger from "./index";
import { ContextMock, HttpRequestMock } from "../mock/azure.mock";
import { HelpFaq } from "../shared/services/helpFaq/helpFaqService";

describe("HelpFaq Index", () => {
    test("Happy Path", async () => {
        const spy = jest
            .spyOn(HelpFaq.prototype, "getFaqs")
            .mockImplementation(async () => Promise.resolve({ data: undefined, Error: false }));
        await httpTrigger(ContextMock, HttpRequestMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body.data).toEqual(undefined);
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
