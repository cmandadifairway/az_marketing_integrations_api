import { ServiceBase } from "../../shared/service/serviceBase";
import { TYPES } from "../../shared/inversify/types";
import { LoanOfficerDataService } from "../../shared/service/loanOfficer/repository/loanOfficerDataAccess";
import { UpdateLoGroupRequest } from "../model/updateLoGroupRequest";
import { Response } from "../../shared/model/response";

export interface UpdateLoService {
    updateLoGroup(data: UpdateLoGroupRequest): Promise<Response>;
}

export class UpdateLoGroupService extends ServiceBase implements UpdateLoService {
    private readonly loDataService = this.resolve<LoanOfficerDataService>(TYPES.LoanOfficerDataService);

    async updateLoGroup(data: UpdateLoGroupRequest): Promise<Response> {
        let updateField = {};
        if (data.groupType === "primary") {
            updateField = { campaignGroup: data.groupId };
        } else if (data.groupType === "backup") {
            updateField = { backupGroup: data.groupId };
        }
        let updateQuery = {};
        if (data.action === "add") {
            updateQuery["$addToSet"] = updateField;
        } else if (data.action === "remove") {
            updateQuery["$pull"] = updateField;
        }

        return await this.loDataService.updateLoanOfficer({ partitionKey: data.loEmail }, updateQuery);
    }
}
