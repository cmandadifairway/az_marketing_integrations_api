import { GroupLOResponse } from "../../../GroupLOs/model/groupLOsResponse";
import { Response } from "../../model/response";
import { ServiceBase } from "../serviceBase";
import { TYPES } from "../../inversify/types";
import { GroupDataAccess } from "./repository/groupDataAccess";
import { GroupService } from "./group";
import { GroupLOsRequest } from "../../../GroupLOs/model/groupLOsRequest";

export class CampaignGroupService extends ServiceBase implements GroupService {
    private readonly groupDataAccess = this.resolve<GroupDataAccess>(TYPES.CampaignGroupDataAccess);

    async getGroupIds(queryFilter?: Object): Promise<Response> {
        return await this.groupDataAccess.getGroupIds(queryFilter);
    }

    async getGroupLOs(queryFilter: GroupLOsRequest): Promise<GroupLOResponse> {
        return await this.groupDataAccess.getGroupLOs(queryFilter);
    }
}
