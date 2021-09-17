import { UpdateFaqRequest } from "../../../UpdateFaq/model/updateFaqRequest";
import { HelpFaq } from "./helpFaqService";
import { HelpFaqDataAccess } from "./repository/helpFaqDataAccess";

describe("HelpFaq Service", () => {
    const validInputRequest: UpdateFaqRequest = {
        id: "12355",
        question: "Test?",
        answer: "Test answer",
        answerType: "text",
        active: false,
        category: "test",
        username: "adminTest",
        orderBy: 10,
    };

    test("Update should send a valid result as data exists", async () => {
        const spy = jest
            .spyOn(HelpFaqDataAccess.prototype, "updateFaq")
            .mockImplementation(() => Promise.resolve({ data: "Successfully updated faq.", Error: false }));
        const helpFaqService = new HelpFaq();
        const result = await helpFaqService.updateFaq(validInputRequest);
        expect(spy).toHaveBeenCalled();
        expect(result.Error).toBeFalsy();
        expect(result.data).toBe("Successfully updated faq.");
    });
});
