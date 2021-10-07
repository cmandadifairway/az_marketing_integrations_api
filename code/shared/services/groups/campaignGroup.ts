import { GroupLOResponse } from "./../../../GroupLOs/Model/groupLOsResponse";
import { Response } from "../../model/response";
import { ServiceBase } from "../serviceBase";
import { TYPES } from "../../inversify/types";
import { GroupDataAccess } from "./repository/groupDataAccess";
import { GroupService } from "./group";
import { GroupLOsRequest } from "../../../GroupLOs/Model/groupLOsRequest";

export class CampaignGroupService extends ServiceBase implements GroupService {
    private readonly groupDataAccess = this.resolve<GroupDataAccess>(TYPES.CampaignGroupDataAccess);

    async getGroupIds(): Promise<Response> {
        return await this.groupDataAccess.getGroupIds();
    }

    async getGroupLOs(queryFilter: GroupLOsRequest): Promise<GroupLOResponse> {
        return await this.groupDataAccess.getGroupLOs(queryFilter);
    }
}
