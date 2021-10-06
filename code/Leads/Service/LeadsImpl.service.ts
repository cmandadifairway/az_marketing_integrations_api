import { ServiceBase } from "../../shared/services/serviceBase";
import { LeadsResponse } from "../../shared/model/leadsResponse";
import { LeadsService } from "./Leads.service";
import { LeadFilterService } from "./LeadFilter.service";
import { TYPES } from "../../shared/inversify/types";
import { LeadDataService } from "../../shared/services/leads/repository/leadDataAccess";
import { LeadsRequest } from "../classes/leadsRequest";

export class LeadsServiceImpl extends ServiceBase implements LeadsService {
    private readonly leadDataService = this.resolve<LeadDataService>(TYPES.LeadDataService);
    private readonly leadFilterService = this.resolve<LeadFilterService>(TYPES.LeadFilterServiceImpl);

    public async getAllLeadsForDisplay(requestData: LeadsRequest): Promise<LeadsResponse> {
        const filterQuery = await this.buildQueryFilter(requestData);
        const projection = {
            currentLeadStatus: 1,
            firstName: 1,
            lastName: 1,
            lastUpdated: 1,
            email: 1,
            leadRating: 1,
            city: 1,
            state: 1,
            postalCode: 1,
            leadType: 1,
            channelWebsite: 1,
            "activity.title": 1,
            "activity.activityDateTime": 1,
            leadCreateDt: 1,
        };
        const leadsResponse: LeadsResponse = await this.leadDataService.getAllLeads({ $and: filterQuery }, projection);
        // can't get first engaged leads filtered by date range via query
        // for the analytics screen so we have to do via code
        if (requestData.engagedMinDate && requestData.engagedMaxDate) {
            leadsResponse.leads = this.getEngagedLeadsPerAnalytics(requestData, leadsResponse.leads);
        }
        return leadsResponse;
    }

    private async buildQueryFilter(requestData: LeadsRequest) {
        let filter = [],
            optionalFilters = [];
        filter.push({
            "loanOfficer.loEmail": requestData.loEmail.toLowerCase(),
        });
        if (!requestData.engagedMinDate && !requestData.engagedMaxDate) {
            optionalFilters = await this.leadFilterService.getOptionalFilters(requestData);
        }

        return filter.concat(optionalFilters);
    }

    private getEngagedLeadsPerAnalytics(requestData: LeadsRequest, leads: any) {
        let engagedLeads = [];
        engagedLeads = leads.filter(function (lead) {
            let firstEngagedInRange = false;
            if (lead.activity) {
                const engagedActivities = lead.activity.filter(function (activity) {
                    return (
                        activity.title.toLowerCase().includes("inbound") || activity.title == "Live Transfer Successful"
                    );
                });
                const engagedMinDate = new Date(requestData.engagedMinDate);
                const engagedMaxDate = new Date(requestData.engagedMaxDate);
                if (engagedActivities && engagedActivities.length > 0) {
                    const firstEngagedDate = new Date(engagedActivities[0].activityDateTime);
                    firstEngagedInRange = firstEngagedDate >= engagedMinDate && firstEngagedDate <= engagedMaxDate;
                }
            }

            let shouldReturnLead = false;
            // if they also want created
            if (requestData.createdMinDate && requestData.createdMaxDate) {
                const createdMinDate = new Date(requestData.createdMinDate);
                const createdMaxDate = new Date(requestData.createdMaxDate);
                const leadCreatedDate = new Date(lead.leadCreateDt);
                shouldReturnLead =
                    (leadCreatedDate >= createdMinDate && leadCreatedDate <= createdMaxDate) || firstEngagedInRange;
            } else {
                shouldReturnLead = firstEngagedInRange;
            }
            return shouldReturnLead;
        });

        return engagedLeads;
    }
}
