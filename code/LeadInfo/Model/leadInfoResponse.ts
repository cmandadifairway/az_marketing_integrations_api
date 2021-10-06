import { Lead } from "./../../shared/model/Lead";
import { Response } from "../../shared/model/response";

export class LeadInfoResponse implements Response {
    data: Lead;
    Error: boolean;
}
