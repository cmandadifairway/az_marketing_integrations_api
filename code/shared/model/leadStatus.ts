import { CurrentLeadStatus } from "./currentLeadStatus";

export interface LeadStatus {
    type: CurrentLeadStatus;
    message: string;
    statusDateTime: string;
}
