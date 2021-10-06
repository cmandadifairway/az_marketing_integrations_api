import { DashboardResponse } from "../Model/dashboardResponse";

export interface GetDashBoardDaoService {
    getDashBoardDaoDetails: (emailAddress: string) => Promise<DashboardResponse>;
}
