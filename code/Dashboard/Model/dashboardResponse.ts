import { Response } from "../../shared/model/response";

export class DashboardResponse implements Response {
    data: {
        qualifiedLeads: DashboardLead[];
        favorites: DashboardLead[];
        insights: Insights;
        Error: boolean;
    };
    Error: boolean;
}

export interface DashboardLead {
    _id: string;
    channelWebsite: string;
    firstName: string;
    lastName: string;
    leadType: string;
    lastStatusUpdated?: string;
    leadCreateDateTime?: string;
    // Returns from api but may be null value
    city?: string;
    state?: string;
    // Optional return from api
    email?: string;
    currentLeadStatus?: string;
    // Optional and may be null value
    postalCode?: string;
}

export interface Insights {
    totalLeadsNum: number;
    qualifiedLeadsNum: number;
    respondedLeadsNum: number;
    respondedLeads?: string[];
}
