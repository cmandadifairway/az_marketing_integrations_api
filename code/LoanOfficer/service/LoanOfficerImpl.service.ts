import { LoanOfficerService } from "./LoanOfficer.service";
import { ServiceBase } from "../../shared/service/serviceBase";
import { TYPES } from "../../shared/inversify/types";
import { LoanOfficerDataService } from "../../shared/service/loanOfficer/repository/loanOfficerDataAccess";
import { LoanOfficerResponse } from "../model/loanOfficerResponse";

export class LoanOfficerServiceImpl extends ServiceBase implements LoanOfficerService {
    private readonly loDataService = this.resolve<LoanOfficerDataService>(TYPES.LoanOfficerDataService);

    async getLoanOfficer(email: string): Promise<LoanOfficerResponse> {
        return this.loDataService.getLoanOfficer({ partitionKey: email }, true);
    }
}
