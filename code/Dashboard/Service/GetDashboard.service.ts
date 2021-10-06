import { Response } from "../../shared/model/response";
import { DashboardRequest } from "../Model/dashboardRequest";

export interface GetDashboardService {
    getDashBoardInfo: (requestData: DashboardRequest) => Promise<Response>;
}
