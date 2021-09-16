import { CurrentLeadStatus } from "./CurrentLeadStatus";

export interface LeadStatus {
    type: CurrentLeadStatus;
    message: string;
    statusDateTime: string;
}
