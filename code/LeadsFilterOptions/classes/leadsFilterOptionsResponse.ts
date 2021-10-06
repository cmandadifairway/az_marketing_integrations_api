import { Lead } from "./../../shared/model/Lead";
import { Response } from "../../shared/model/response";

export class LeadsFilterOptionsResponse implements Response {
    data: LeadsFilters;
    Error: boolean;
}

export interface LeadsFilters {
    leadStatus: string[];
    loanType: string[];
    loanSource: string[];
    leadState: string[];
}
