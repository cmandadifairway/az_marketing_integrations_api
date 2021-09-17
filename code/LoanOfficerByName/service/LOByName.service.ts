import { LoanOfficerByNameResponse } from "../model/loanOfficerByNameResponse";

export interface LOByNameService {
    getLoanOfficerByName: (name: string) => Promise<LoanOfficerByNameResponse>;
}
