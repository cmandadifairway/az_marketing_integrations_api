import { ServiceBase } from "../../shared/services/serviceBase";
import { LeadDataService } from "../../shared/services/leads/repository/leadDataAccess";
import { GetLeadService } from "./getLead.service";
import { TYPES } from "../../shared/inversify/types";
import { LeadInfoRequest } from "../Model/leadInfoRequest";
import { LeadInfoResponse as LeadInfoResponse } from "../Model/leadInfoResponse";

export class GetLeadServiceImpl extends ServiceBase implements GetLeadService {
    private readonly leadDataService = this.resolve<LeadDataService>(TYPES.LeadDataService);

    async getLeadInfo(requestData: LeadInfoRequest): Promise<LeadInfoResponse> {
        return await this.leadDataService.getLead({ partitionKey: requestData.id }, true);
    }
}
