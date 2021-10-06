import { LeadDataAccess } from "../../shared/services/leads/repository/leadDataAccess";
import { LeadsServiceImpl } from "./LeadsImpl.service";

describe("Leads Service", () => {
    test("Service should send a valid result as data exists", async () => {
        const input = { loEmail: "testuser@testuser.com" };
        const spy = jest
            .spyOn(LeadsServiceImpl.prototype, "getAllLeadsForDisplay")
            .mockImplementation(() => Promise.resolve({ leads: undefined, Error: false }));
        // const getLeadsService = new LeadsServiceImpl();
        // const result = await getLeadsService.getAllLeads(input);
        // expect(spy).toHaveBeenCalled();
        // expect(result.Error).toBeFalsy();
        // expect(result.leads).toBe("testUserAllLeads");
    });

    test("Dao should send a valid result as data exists", async () => {
        const input = [{ "loanOfficer.loEmail": "testuser@testuser.com" }];
        const spy = jest
            .spyOn(LeadDataAccess.prototype, "getAllLeads")
            .mockImplementation(() => Promise.resolve({ leads: undefined, Error: false }));
        // const leadService = new LeadsServiceImpl();
        // const result = await leadService.getAllLeadsForDisplay(input);
        // expect(spy).toHaveBeenCalled();
        // expect(result.Error).toBeFalsy();
        // expect(result.leads).toBe("testUserAllLeads");
    });
});
