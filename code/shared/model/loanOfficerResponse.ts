import { LoanOfficer } from "./LoanOfficer";
import { Response } from "./response";

export class LoanOfficerResponse implements Response {
    data: LoanOfficer;
    Error: boolean;
}
