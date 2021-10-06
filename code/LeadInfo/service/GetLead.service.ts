import { LeadInfoRequest } from "../Model/leadInfoRequest";
import { LeadInfoResponse } from "../Model/leadInfoResponse";

export interface GetLeadService {
    getLeadInfo: (requestData: LeadInfoRequest) => Promise<LeadInfoResponse>;
}
