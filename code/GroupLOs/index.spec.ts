import groupLos from "./index";
import { ContextMock, HttpRequestMock } from "../mock/azure.mock";
import { CampaignGroupService } from "../shared/service/groups/campaignGroup";
import { AppInsightsService } from "../shared/service/monitoring/applicationInsights";

describe("Group LOs Index tests", () => {
    beforeAll(() => {
        jest.spyOn(AppInsightsService.prototype, "startService").mockImplementation(async () => Promise.resolve());
    });

    test("Happy Path", async () => {
        const response = {
            data: [
                {
                    _id: "loanofficer@email.com",
                    firstName: "Test",
                    lastName: "Testlast",
                    phone: "+18178675309",
                },
            ],
            Error: false,
        };
        const spy = jest
            .spyOn(CampaignGroupService.prototype, "getGroupLOs")
            .mockImplementation(async () => Promise.resolve(response));
        const reqMock = { ...HttpRequestMock };
        reqMock.query = { campaignGroup: "tx" };
        await groupLos(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
