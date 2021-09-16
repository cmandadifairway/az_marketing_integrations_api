import { GroupLOResponse } from "../../../GroupLOs/model/groupLOsResponse";
import { GroupLOsRequest } from "../../../GroupLOs/model/groupLOsRequest";
import { Response } from "../../model/response";

export interface GroupService {
    getGroupIds: (queryFilter?: Object) => Promise<Response>;
    getGroupLOs: (request: GroupLOsRequest) => Promise<GroupLOResponse>;
}
