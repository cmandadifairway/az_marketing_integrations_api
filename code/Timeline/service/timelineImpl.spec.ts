import { TimelineImpl } from "./TimelineSerivceImpl.service";
import { TimelineRequest } from "../model/timelineRequest";
import { TimelineResponse } from "../model/timelineResponse";
import { LoanOfficerResponse } from "../../shared/model/loanOfficerResponse";
import { mockLoanOfficer } from "../../mock/loanOfficer.mock";
import { BigQueryWrapper } from "../../shared/services/bigQuery/bigQuery";
import { LoanOfficerDataAccess } from "../../shared/services/loanOfficer/repository/loanOfficerDataAccess";

describe("Timeline Index", () => {
    const mockLOData: LoanOfficerResponse = {
        data: mockLoanOfficer,
        Error: false,
    };

    test("Happy Path", async () => {
        const request: TimelineRequest = {
            loEmail: "testuser@testuser.com",
            minDate: "2021-08-01",
            maxDate: "2021-08-30",
        };
        const mockDatetimeStr = new Date().toISOString();
        const bigQueryData = [
            [
                {
                    event_name: "ff_menubar_tapdashboard",
                    event_datetime_utc: { value: mockDatetimeStr },
                    event_params: [
                        { key: "LeadID", value: { string_value: "testId" } },
                        { key: "User", value: { string_value: mockLoanOfficer._id } },
                    ],
                },
            ],
        ];
        const response: TimelineResponse = {
            data: [
                {
                    eventName: `${mockLoanOfficer.firstName} ${mockLoanOfficer.lastName} clicked on the Dashboard menu link.`,
                    eventTimestamp: mockDatetimeStr,
                    leadId: "testId",
                },
            ],
            Error: false,
        };
        const bigQuerySpy = jest
            .spyOn(BigQueryWrapper.prototype, "queryData")
            .mockImplementation(async () => Promise.resolve(bigQueryData));
        const loSpy = jest
            .spyOn(LoanOfficerDataAccess.prototype, "getLoanOfficer")
            .mockImplementation(async () => Promise.resolve(mockLOData));

        const getTimelineService = new TimelineImpl();
        const result = await getTimelineService.getTimelineService(request);

        expect(bigQuerySpy).toHaveBeenCalled();
        expect(loSpy).toHaveBeenCalled();
        expect(result.Error).toBeFalsy();
        expect(result.data).toStrictEqual(response.data);
    });
});
