import { Response } from "./response";

export class LoanOfficerByNameResponse implements Response {
    data: Array<LoanOfficerByName>;
    Error: boolean;
}

export interface LoanOfficerByName {
    _id: string;
    firstName: string;
    lastName: string;
}
