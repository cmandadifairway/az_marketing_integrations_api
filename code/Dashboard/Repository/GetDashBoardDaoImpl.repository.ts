import { DashboardLead, DashboardResponse, Insights } from "./../Model/dashboardResponse";
import { GetDashBoardDaoService } from "./GetDashBoardDaoService.repository";
import { DataAccessBase } from "../../shared/services/dataAccessBase";
import { ReadPreference } from "mongodb";

export class GetDashBoardDaoImpl extends DataAccessBase implements GetDashBoardDaoService {
    async getDashBoardDaoDetails(emailAddress: string): Promise<DashboardResponse> {
        let dashboardResponse: DashboardResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const loCollection = db.collection("LoanOfficer", {
                readPreference: ReadPreference.SECONDARY_PREFERRED,
            });
            const leadsCollection = db.collection("leads", {
                readPreference: ReadPreference.SECONDARY_PREFERRED,
            });

            const qualifiedLeads: DashboardLead[] = await leadsCollection
                .find({
                    "loanOfficer.loEmail": emailAddress,
                    currentLeadStatus: "Qualified Lead",
                })
                .project<DashboardLead>({
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    city: 1,
                    state: 1,
                    postalCode: 1,
                    channelWebsite: 1,
                    leadType: 1,
                    leadCreateDateTime: 1,
                    lastStatusUpdated: 1,
                })
                .toArray();
            const favorites: DashboardLead[] = await leadsCollection
                .find({
                    "loanOfficer.loEmail": emailAddress,
                    leadRating: 5,
                })
                .project<DashboardLead>({
                    firstName: 1,
                    lastName: 1,
                    city: 1,
                    state: 1,
                    channelWebsite: 1,
                    currentLeadStatus: 1,
                    leadType: 1,
                })
                .toArray();
            const insights: Insights = await loCollection.findOne<Insights>(
                { partitionKey: emailAddress },
                {
                    projection: {
                        totalLeadsNum: 1,
                        qualifiedLeadsNum: 1,
                        respondedLeads: 1,
                        _id: 0,
                    },
                }
            );

            if (insights) {
                insights.respondedLeadsNum = insights.respondedLeads ? insights.respondedLeads.length : 0;
                delete insights["respondedLeads"];
            }

            dashboardResponse = {
                data: {
                    qualifiedLeads,
                    favorites,
                    insights,
                    Error: false,
                },
                Error: false,
            };
        } catch (error) {
            this.customLogger.error("Error in Dashboard repo module", error);
            throw error;
        }
        return dashboardResponse;
    }
}
