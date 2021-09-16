import { LoanOfficerByName } from "../../../../LoanOfficerByName/model/loanOfficerByNameResponse";
import { DataAccessBase } from "../../dataAccessBase";
import { ReadPreference } from "mongodb";
import { Response } from "../../../../shared/model/response";
import { LoanOfficerResponse } from "../../../../LoanOfficer/model/loanOfficerResponse";
import { LoanOfficerByNameResponse } from "../../../../LoanOfficerByName/model/loanOfficerByNameResponse";
import { LoanOfficer } from "../../../model/LoanOfficer";

export interface LoanOfficerDataService {
    getLoanOfficer(query: object, throwError: boolean): Promise<LoanOfficerResponse>;
    getLoanOfficerByName(query: object, throwError: boolean): Promise<LoanOfficerByNameResponse>;
    updateLoanOfficer(query: object, updateQuery: object): Promise<Response>;
}

export class LoanOfficerDataAccess extends DataAccessBase implements LoanOfficerDataService {
    async getLoanOfficer(query: object, throwError: boolean): Promise<LoanOfficerResponse> {
        let loanOfficerResponse: LoanOfficerResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const data = await db
                .collection("LoanOfficer", {
                    readPreference: ReadPreference.SECONDARY_PREFERRED,
                })
                .findOne<LoanOfficer>(query);

            loanOfficerResponse = {
                data,
                Error: false,
            };
        } catch (error) {
            this.logger.error("Error while trying to get LO by " + JSON.stringify(query), error);
            if (throwError) {
                throw error;
            }
        }
        return loanOfficerResponse;
    }

    async getLoanOfficerByName(query: object, throwError: boolean): Promise<LoanOfficerByNameResponse> {
        let loanOfficerByNameResponse: LoanOfficerByNameResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const data = await db
                .collection("LoanOfficer", {
                    readPreference: ReadPreference.SECONDARY_PREFERRED,
                })
                .find(query)
                .limit(10)
                .project<LoanOfficerByName>({ firstName: 1, lastName: 1 })
                .toArray();

            loanOfficerByNameResponse = {
                data,
                Error: false,
            };
        } catch (error) {
            this.logger.error("Error while trying to get LOs by name", error);
            if (throwError) {
                throw error;
            }
        }
        return loanOfficerByNameResponse;
    }

    async updateLoanOfficer(query: object, updateQuery: object): Promise<Response> {
        let response: Response;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const result = await db.collection("LoanOfficer").updateOne(query, updateQuery);

            let msg = "Successfully updated loan officer.";
            if (result.modifiedCount < 1) {
                throw new Error("Loan officer was not updated.");
            }
            response = {
                data: msg,
                Error: false,
            };
        } catch (error) {
            const queryString = JSON.stringify(query);
            this.logger.error(`Error while updating loan officer ${queryString} in db`, error);
            throw error;
        }
        return response;
    }
}
