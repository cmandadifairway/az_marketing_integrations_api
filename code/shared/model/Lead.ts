import { AssignedLoanOfficer } from "./AssignedLoanOfficer";
import { CurrentLeadStatus } from "./CurrentLeadStatus";
import { LeadActivity } from "./LeadActivity";
import { LeadNote } from "./leadNote";
import { LeadStatus } from "./LeadStatus";
import { LoanStatus } from "./loanStatus";
import { Referral } from "./referral";

export interface Lead {
    _id: string;
    currentLeadStatus: CurrentLeadStatus;
    channelWebsite: string;
    email: string;
    firstName: string;
    lastName: string;
    leadType: string;
    lastUpdated: string;
    leadCreateDt: string;
    leadRating: number;
    // Returns from api but may be null value
    city?: string;
    postalCode?: string;
    state?: string;
    // The following are optional to return from the api but usually exist in the DB
    phone?: string;
    link?: string;
    leadStatus?: LeadStatus[];
    lastStatusUpdated?: string;
    loanOfficer?: AssignedLoanOfficer;
    activity?: LeadActivity[];
    createdBy?: string;
    loanStatus?: LoanStatus[];
    externalLeadId?: string;
    lastActivityUpdated?: string;
    // Optional to return from api and may be null or not exist in DB
    street?: string;
    leadComment?: string;
    leadNotes?: LeadNote[];
    referral?: Referral[];
    currentLoanStatus?: string;
    leadAssignedDt?: Date;
    campaignGroup?: string;
}
