import { ServiceBase } from "../../shared/services/serviceBase";
import { DashboardResponse } from "./../Model/dashboardResponse";
import { GetDashboardService } from "./GetDashboard.service";
import { GetDashBoardDaoService } from "../Repository/GetDashBoardDaoService.repository";
import { TYPES } from "../../shared/inversify/types";

export class GetDashBoardImpl extends ServiceBase implements GetDashboardService {
    private readonly getDashBoardDaoService = this.resolve<GetDashBoardDaoService>(TYPES.GetDashBoardDaoImpl);

    async getDashBoardInfo(queryFilter: object): Promise<DashboardResponse> {
        // B2C user can enter emails in UpperCase, must lower case for query
        const emailAddress = queryFilter["loEmail"].toLowerCase();
        return await this.getDashBoardDaoService.getDashBoardDaoDetails(emailAddress);
    }
}
