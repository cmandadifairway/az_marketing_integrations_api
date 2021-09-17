import { LoanOfficer } from "./../../shared/model/loanOfficer";
import { Response } from "../../shared/model/response";

export class LoanOfficerResponse implements Response {
    data: LoanOfficer;
    Error: boolean;
}
