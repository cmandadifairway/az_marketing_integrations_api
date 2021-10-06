import { LeadDataAccess } from "./leadDataAccess";

describe("LeadDataAccess tests", () => {
    test("Dao should send a valid result as data exists", async () => {
        const spy = jest
            .spyOn(LeadDataAccess.prototype, "updateLead")
            .mockImplementation(() => Promise.resolve({ data: "Lead Updated", Error: false }));
        const leadDataAccess = new LeadDataAccess();
        const result = await leadDataAccess.updateLead("12355", {});
        expect(spy).toHaveBeenCalled();
        expect(result.Error).toBeFalsy();
        expect(result.data).toBe("Lead Updated");
    });

    test("Dao should send a error result as wrong input", async () => {
        const spy = jest
            .spyOn(LeadDataAccess.prototype, "updateLead")
            .mockImplementation(() => Promise.resolve({ data: "Error in Update Lead Info repo module", Error: true }));
        const leadDataAccess = new LeadDataAccess();
        const result = await leadDataAccess.updateLead("", {});
        expect(spy).toHaveBeenCalled();
        expect(result.Error).toBeTruthy();
        expect(result.data).toBe("Error in Update Lead Info repo module");
    });
});
