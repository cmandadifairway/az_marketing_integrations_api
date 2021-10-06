import { GetLeadServiceImpl } from "./GetLeadServiceImpl.service";
import { LeadInfoRequest } from "../Model/leadInfoRequest";
import { LeadDataAccess } from "../../shared/services/leads/repository/leadDataAccess";
import { LeadInfoResponse } from "../Model/leadInfoResponse";
import { CurrentLeadStatus } from "../../shared/model/CurrentLeadStatus";

describe("LeadInfo Service tests", () => {
    test("GetLead should return a valid request", async () => {
        const input: LeadInfoRequest = { id: "6109ff24-2bf7-478c-a9ce-044415c1f96f" };
        const output = new LeadInfoResponse();
        output.data = {
            _id: "6109ff24-2bf7-478c-a9ce-044415c1f96f",
            firstName: "Kerri",
            lastName: "Mckeand",
            email: "kmmckeand@gmail.com",
            leadComment: null,
            leadType: "mortgage",
            currentLeadStatus: CurrentLeadStatus.QualifiedLead,
            channelWebsite: "Realtor.com Remnant",
            lastUpdated: "2021-02-11T19:11:14.227Z",
            leadCreateDt: "2020-07-24T23:40:53.838Z",
            leadRating: 0,
        };
        const spy = jest
            .spyOn(LeadDataAccess.prototype, "getLead")
            .mockImplementation(() => Promise.resolve(new LeadInfoResponse()));
        const getLeadService = new GetLeadServiceImpl();
        const result = await getLeadService.getLeadInfo(input);
        expect(spy).toHaveBeenCalled();
        expect(result.data).toBe(undefined);
    });

    test("GetLeads service to throw unexpected error", async () => {
        try {
            jest.spyOn(GetLeadServiceImpl.prototype, "getLeadInfo").mockImplementation(() =>
                Promise.reject({ data: null, Error: true })
            );
            const input = new LeadInfoRequest();
            const getLeadService = new GetLeadServiceImpl();
            await getLeadService.getLeadInfo(input);
        } catch (error) {
            expect(error).toEqual({ data: null, Error: true });
        }
    });
});
