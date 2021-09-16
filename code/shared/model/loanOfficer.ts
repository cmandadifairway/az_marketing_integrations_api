import { AnalyticsData } from "./analyticsData";

export interface LoanOfficer {
    [key: number]: Year;
    _id: string;
    partitionKey: string;
    firstName?: string;
    lastName?: string;
    createdDT: string;
    updatedDT: string;
    verseUUID: Array<string>;
    phone?: string;
    totalLeadsNum: number;
    respondedLeads: Array<string>;
    qualifiedLeadsNum: number;
    campaignGroup?: Array<string>;
    backupGroup: Array<string>;
}

export interface Year {
    [key: string]: Month;
}

export interface Month {
    [key: number]: {
        [key: string]: AnalyticsData;
    };
}
