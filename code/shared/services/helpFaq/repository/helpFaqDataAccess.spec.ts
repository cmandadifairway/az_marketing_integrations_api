import { FaqDetailsDao } from "../../../model/faqDetailsDao";
import { HelpFaqDataAccess } from "./helpFaqDataAccess";

describe("Faq Data Access Service tests", () => {
    const validInputDal: FaqDetailsDao = {
        id: "12355",
        question: "Test?",
        answer: "Test answer",
        answerType: "text",
        active: false,
        category: "test",
        history: {
            historyDT: new Date(Date.now()),
            username: "adminTest",
        },
        orderBy: 10,
    };

    test("update should send a valid result as data exists", async () => {
        const spy = jest
            .spyOn(HelpFaqDataAccess.prototype, "updateFaq")
            .mockImplementation(() => Promise.resolve({ data: "Successfully updated faq.", Error: false }));
        const updateFaqDal = new HelpFaqDataAccess();
        const result = await updateFaqDal.updateFaq(validInputDal);
        expect(spy).toHaveBeenCalled();
        expect(result.Error).toBeFalsy();
        expect(result.data).toBe("Successfully updated faq.");
    });

    test("update should send a message of nothing modified when sent wrong input", async () => {
        const input = {};
        const spy = jest
            .spyOn(HelpFaqDataAccess.prototype, "updateFaq")
            .mockImplementation(() => Promise.resolve({ data: "No faqs were modified.", Error: false }));
        const updateFaqDal = new HelpFaqDataAccess();
        const result = await updateFaqDal.updateFaq(new FaqDetailsDao());
        expect(spy).toHaveBeenCalled();
        expect(result.Error).toBeFalsy();
        expect(result.data).toBe("No faqs were modified.");
    });
});
