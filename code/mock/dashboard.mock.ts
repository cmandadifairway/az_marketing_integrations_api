import { DashboardLead, Insights } from "../Dashboard/Model/dashboardResponse";
import { State } from "../shared/model/states";

export const mockFavDashboardLead: DashboardLead = {
    _id: "test-guid-1",
    currentLeadStatus: "Qualified Lead",
    channelWebsite: "Realtor.com Remnant",
    city: "Aurora",
    firstName: "TestFirst",
    lastName: "TastLast",
    leadType: "mortgage",
    state: State.IL,
};

export const mockQualifiedDashboardLead: DashboardLead = {
    _id: "test-guid-2",
    channelWebsite: "Realtor.com Remnant",
    city: "Arlington",
    email: "test@testemail.com",
    firstName: "TestFirst",
    lastName: "TastLast",
    leadType: "mortgage",
    state: State.TX,
    postalCode: "75052",
    lastStatusUpdated: "2020-07-25T00:10:54.478Z",
};

export const mockInsights: Insights = {
    totalLeadsNum: 5,
    qualifiedLeadsNum: 2,
    respondedLeadsNum: 2,
};
