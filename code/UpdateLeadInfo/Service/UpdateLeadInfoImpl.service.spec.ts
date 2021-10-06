import { UpdateLeadInfoImpl } from "./UpdateLeadInfoImpl.service";
import { UpdateLeadInfoRequest } from "../Model/updateLeadInfoRequest";
import { LeadDataAccess } from "../../shared/services/leads/repository/leadDataAccess";

describe("UpdateLeadInfo Service", () => {
    const validInput: UpdateLeadInfoRequest = {
        id: "12355",
        leadRating: 5,
        loanStatus: undefined,
        leadNotes: undefined,
        referral: undefined,
        referredTo: undefined,
    };

    test("Service should send a valid result as data exists", async () => {
        const spy = jest
            .spyOn(LeadDataAccess.prototype, "updateLead")
            .mockImplementation(() => Promise.resolve({ data: "Successfully updated lead info.", Error: false }));
        const updateleadinfoservice = new UpdateLeadInfoImpl();
        const result = await updateleadinfoservice.updateLeadInfo(validInput);
        expect(spy).toHaveBeenCalled();
        expect(result.Error).toBeFalsy();
        expect(result.data).toBe("Successfully updated lead info.");
    });
});
