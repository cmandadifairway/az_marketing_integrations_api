import { TYPES } from "../../shared/inversify/types";
import { LeadsResponse } from "../../shared/model/leadsResponse";
import { LeadDataService } from "../../shared/services/leads/repository/leadDataAccess";
import { ServiceBase } from "../../shared/services/serviceBase";
import { LeadsFilterOptionsRequest } from "../classes/leadsFilterOptionsRequest";
import { LeadsFilterOptionsResponse, LeadsFilters } from "../classes/leadsFilterOptionsResponse";
import { UtilityService } from "../../shared/utils/utility.service";

export interface LeadsFilterOptionsService {
    getAllFilterOptions: (leadsFilterOptionsRequest: LeadsFilterOptionsRequest) => Promise<LeadsFilterOptionsResponse>;
}

export class LeadsFilterOptionsServiceImpl extends ServiceBase implements LeadsFilterOptionsService {
    private readonly leadDataService = this.resolve<LeadDataService>(TYPES.LeadDataService);
    private readonly utility = this.resolve<UtilityService>(TYPES.UtilityService);

    public async getAllFilterOptions(
        leadsFilterOptionsRequest: LeadsFilterOptionsRequest
    ): Promise<LeadsFilterOptionsResponse> {
        const filterQuery = {
            "loanOfficer.loEmail": leadsFilterOptionsRequest.loEmail,
        };
        const projection = {
            "leadStatus.type": 1,
            leadType: 1,
            channelWebsite: 1,
            state: 1,
        };

        const leadsResponse: LeadsResponse = await this.leadDataService.getAllLeads(filterQuery, projection);
        let leadsFilters: LeadsFilters;

        if (leadsResponse.leads?.length > 0) {
            // get leadStatus
            const arrLeadStatus = leadsResponse.leads.map((o) => {
                return o.leadStatus;
            });
            const leadStatus = this.utility.getDistinctValues(arrLeadStatus, "type", true);
            const loanType = this.utility.getDistinctValues(leadsResponse.leads, "leadType", true);
            const loanSource = this.utility.getDistinctValues(leadsResponse.leads, "channelWebsite", true);
            const leadState = this.utility.getDistinctValues(leadsResponse.leads, "state", true);
            leadsFilters = { leadStatus, loanType, loanSource, leadState };
        }
        return { data: leadsFilters, Error: false };
    }
}
