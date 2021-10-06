import { DataAccessBase } from "../../dataAccessBase";
import { ReadPreference } from "mongodb";
import { Response } from "../../../../shared/model/response";
import { LeadInfoResponse } from "../../../../LeadInfo/Model/leadInfoResponse";
import { LeadsResponse } from "../../../model/leadsResponse";
import { Lead } from "../../../model/Lead";

export interface LeadDataService {
    getAllLeads(filterQuery: object, projection?: object): Promise<LeadsResponse>;
    getLead(query: object, throwError: boolean): Promise<Response>;
    updateLead(leadID: string, updateQuery: object): Promise<Response>;
}

export class LeadDataAccess extends DataAccessBase implements LeadDataService {
    async getAllLeads(filterQuery: object, projection?: object): Promise<LeadsResponse> {
        let leadsResponse: LeadsResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            let leads: Lead[];
            const leadCollection = db.collection("leads", {
                readPreference: ReadPreference.SECONDARY_PREFERRED,
            });
            if (projection) {
                leads = await leadCollection.find(filterQuery).project<Lead>(projection).toArray();
            } else {
                leads = await leadCollection.find<Lead>(filterQuery).toArray();
            }
            leadsResponse = {
                leads,
                Error: false,
            };
        } catch (error) {
            this.customLogger.error("Error while getting all leads", error);
            throw error;
        }
        return leadsResponse;
    }

    async getLead(query: object, throwError: boolean): Promise<LeadInfoResponse> {
        let leadInfo: LeadInfoResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const queryResults = await db
                .collection("leads", {
                    readPreference: ReadPreference.SECONDARY_PREFERRED,
                })
                .findOne<Lead>(query);

            leadInfo = {
                data: queryResults,
                Error: false,
            };
        } catch (error) {
            this.customLogger.error("Error while trying to get lead by " + JSON.stringify(query), error);
            if (throwError) {
                throw error;
            }
        }
        return leadInfo;
    }

    async updateLead(leadID: string, updateQuery: object): Promise<Response> {
        let responseData: Response;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const result = await db.collection("leads").updateOne({ partitionKey: leadID }, updateQuery);

            let msg = "Successfully updated lead.";
            if (result.modifiedCount < 1) {
                throw new Error("Lead was not updated.");
            }
            responseData = {
                data: msg,
                Error: false,
            };
        } catch (error) {
            this.customLogger.error(`Error while updating lead ${leadID} in db`, error);
            throw error;
        }
        return responseData;
    }
}
