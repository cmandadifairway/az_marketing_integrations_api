import { LeadsRequest } from "../classes/leadsRequest";
import { LeadsResponse } from "../../shared/model/leadsResponse";

export interface LeadsService {
    getAllLeadsForDisplay: (requestData: LeadsRequest) => Promise<LeadsResponse>;
}
