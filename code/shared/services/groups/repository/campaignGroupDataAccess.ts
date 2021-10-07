import { DataAccessBase } from "../../dataAccessBase";
import { GroupLOResponse } from "./../../../../GroupLOs/Model/groupLOsResponse";
import { GroupDataAccess } from "./groupDataAccess";
import { ReadPreference } from "mongodb";
import { Response } from "../../../model/response";
import { GroupLOsRequest } from "../../../../GroupLOs/Model/groupLOsRequest";
import { GroupLO } from "../../../../GroupLOs/Model/groupLOsResponse";

/**
 * This class contains all the methods related to LO groups
 * This class is inversified. For singleton instance use container.get<>
 */
export class CampaignGroupDataAccess extends DataAccessBase implements GroupDataAccess {
    /**
     * Gets Loan Officer GroupIds
     * @usage url/groupIds?_id=TX
     */
    async getGroupIds(): Promise<Response> {
        let response: Response;
        let groupIds: string[];
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            groupIds = await db
                .collection("groups", { readPreference: ReadPreference.SECONDARY_PREFERRED })
                .distinct<string>("_id", {});
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
}
