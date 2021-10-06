import { GroupLOResponse } from "./../../../GroupLOs/Model/groupLOsResponse";
import { GroupLOsRequest } from "../../../GroupLOs/Model/groupLOsRequest";
import { Response } from "../../model/response";

export interface GroupService {
    getGroupIds: (queryFilter?: Object) => Promise<Response>;
    getGroupLOs: (request: GroupLOsRequest) => Promise<GroupLOResponse>;
}
