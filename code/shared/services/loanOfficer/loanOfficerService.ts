import { ServiceBase } from "../../services/serviceBase";
import { TYPES } from "../../inversify/types";
import { LoanOfficerDataService } from "./repository/loanOfficerDataAccess";
import { LoanOfficerResponse } from "../../model/loanOfficerResponse";

export interface LoanOfficerService {
    getLoanOfficer: (email: string) => Promise<LoanOfficerResponse>;
}

export class LoanOfficerServiceImpl extends ServiceBase implements LoanOfficerService {
    private readonly loDataService = this.resolve<LoanOfficerDataService>(TYPES.LoanOfficerDataService);

    async getLoanOfficer(email: string): Promise<LoanOfficerResponse> {
        return this.loDataService.getLoanOfficer({ partitionKey: email }, true);
    }
}
