import { LOByNameService } from "./LOByName.service";
import { ServiceBase } from "../../shared/services/serviceBase";
import { TYPES } from "../../shared/inversify/types";
import { LoanOfficerDataService } from "../../shared/services/loanOfficer/repository/loanOfficerDataAccess";
import { LoanOfficerByNameResponse } from "../../shared/model/loanOfficerByNameResponse";

export class LOByNameServiceImpl extends ServiceBase implements LOByNameService {
    private readonly loDataService = this.resolve<LoanOfficerDataService>(TYPES.LoanOfficerDataService);

    async getLoanOfficerByName(name: string): Promise<LoanOfficerByNameResponse> {
        const query = this.queryFilterBuilder(name.toLowerCase());
        return this.loDataService.getLoanOfficerByName(query, true);
    }

    private queryFilterBuilder(name: string): object {
        let filter = [];
        let query = {};
        let firstName = "";
        let lastName = "";
        const names = name.split(" ");
        if (names.length > 1) {
            firstName = names[0];
            lastName = names[1];
        } else {
            firstName = name;
            lastName = name;
        }
        const firstNameObj = {
            firstName: {
                $regex: new RegExp(`.*${firstName}.*`, "i"),
            },
        };
        filter.push(firstNameObj);
        const lastNameObj = {
            lastName: {
                $regex: new RegExp(`.*${lastName}.*`, "i"),
            },
        };
        filter.push(lastNameObj);

        if (names.length > 1) {
            query["$and"] = filter;
        } else {
            query["$or"] = filter;
        }

        return query;
    }
}
