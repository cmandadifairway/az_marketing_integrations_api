import { LoanOfficerResponse } from "../model/loanOfficerResponse";

export interface LoanOfficerService {
    getLoanOfficer: (email: string) => Promise<LoanOfficerResponse>;
}
