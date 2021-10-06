import { LeadsRequest } from "../classes/leadsRequest";

export interface LeadFilterService {
    getOptionalFilters(requestData: LeadsRequest): Promise<any[]>;
}
