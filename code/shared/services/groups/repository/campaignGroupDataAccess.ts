import { DataAccessBase } from "../../dataAccessBase";
import { GroupLOResponse } from "./../../../../GroupLOs/Model/groupLOsResponse";
import { GroupDataAccess } from "./groupDataAccess";
import { ReadPreference } from "mongodb";
import { TYPES } from "../../../inversify/types";
import { Response } from "../../../model/response";
import { GroupLOsRequest } from "../../../../GroupLOs/Model/groupLOsRequest";
import { GroupLO } from "../../../../GroupLOs/Model/groupLOsResponse";
import { UtilityService } from "../../../utils/utility.service";

/**
 * This class contains all the methods related to LO groups
 * This class is inversified. For singleton instance use container.get<>
 */
export class CampaignGroupDataAccess extends DataAccessBase implements GroupDataAccess {
    private readonly utility = this.resolve<UtilityService>(TYPES.UtilityService);

    /**
     * Gets Loan Officer GroupIds
     * @param queryFilter - query to filter groupIds
     * @usage url/groupIds?_id=TX
     */
    async getGroupIds(queryFilter?: Object): Promise<Response> {
        let response: Response;
        let groupIds: string[];
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const _queryFilter = this.buildQueryFilter(queryFilter);
            groupIds = await db
                .collection("groups", { readPreference: ReadPreference.SECONDARY_PREFERRED })
                .distinct<string>("_id", _queryFilter);
            response = { data: groupIds, Error: false };
        } catch (error) {
            this.customLogger.error("Error while getting group ids from repo", error);
            throw error;
        }
        return response;
    }

    /**
     * Gets Loan Officers assigned to the Group Id in the request
     * @param request - object with groupId to filter by
     */
    async getGroupLOs(request: GroupLOsRequest): Promise<GroupLOResponse> {
        let groupLOResponse: GroupLOResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const _queryFilter = { campaignGroup: request.campaignGroup };
            const groupLOs: GroupLO[] = await db
                .collection("LoanOfficer", { readPreference: ReadPreference.SECONDARY_PREFERRED })
                .find(_queryFilter)
                .project<GroupLO>({ firstName: 1, lastName: 1, phone: 1 })
                .toArray();
            groupLOResponse = { data: groupLOs, Error: false };
        } catch (error) {
            this.customLogger.error(
                `Error while getting loan officers assigned to ${request.campaignGroup} from repo`,
                error
            );
            throw error;
        }
        return groupLOResponse;
    }

    /**
     * Formats query for mongodb collection
     * @param queryFilter
     */
    private buildQueryFilter(queryFilter?: Object) {
        let _queryFilter = {};
        if (queryFilter) {
            const _id = this.utility.convertNullToString(queryFilter["id"]);
            if (_id !== "") {
                _queryFilter = {
                    _id: {
                        $regex: new RegExp(`.*${_id}.*`, "i"),
                    },
                };
            }
        }
        return _queryFilter;
    }
}
