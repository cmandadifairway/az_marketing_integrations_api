import { DashboardResponse } from "./../Model/dashboardResponse";
import { GetDashBoardImpl } from "./GetDashBoardImpl.service";
import { GetDashBoardDaoImpl } from "../Repository/GetDashBoardDaoImpl.repository";
import { DashboardRequest } from "../Model/dashboardRequest";
import { mockFavDashboardLead, mockInsights, mockQualifiedDashboardLead } from "../../mock/dashboard.mock";

describe("DashBoard Service", () => {
    test("Should send a valid result as data exists", async () => {
        const request: DashboardRequest = { loEmail: "testuser@testuser.com" };
        const data = {
            qualifiedLeads: [mockQualifiedDashboardLead],
            favorites: [mockFavDashboardLead],
            insights: mockInsights,
            Error: false,
        };
        const response: DashboardResponse = { Error: false, data };
        const spy = jest
            .spyOn(GetDashBoardDaoImpl.prototype, "getDashBoardDaoDetails")
            .mockImplementation(() => Promise.resolve(response));
        const getDashboardService = new GetDashBoardImpl();
        const result = await getDashboardService.getDashBoardInfo(request);
        expect(spy).toHaveBeenCalled();
        expect(result.Error).toBeFalsy();
        expect(result.data).toBe(data);
    });
});
