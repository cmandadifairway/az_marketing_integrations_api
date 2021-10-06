import httpTrigger from "./index";
import { ContextMock, HttpRequestMock } from "../mock/azure.mock";
import { CampaignGroupService } from "../shared/services/groups/campaignGroup";

describe("Group Index", () => {
    test("Happy Path", async () => {
        const response = { data: ["All GroupIds"], Error: false };
        const spy = jest
            .spyOn(CampaignGroupService.prototype, "getGroupIds")
            .mockImplementation(async () => Promise.resolve(response));
        const reqMock = { ...HttpRequestMock };
        reqMock.query = { id: "tx" };
        await httpTrigger(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
        expect(ContextMock.res.body.Error).toBeFalsy();
    });
});
