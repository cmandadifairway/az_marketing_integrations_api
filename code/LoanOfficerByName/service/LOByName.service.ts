import { LoanOfficerByNameResponse } from "../../shared/model/loanOfficerByNameResponse";

export interface LOByNameService {
    getLoanOfficerByName: (name: string) => Promise<LoanOfficerByNameResponse>;
}
