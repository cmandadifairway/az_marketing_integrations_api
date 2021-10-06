import { GroupLOResponse } from "./../../../../GroupLOs/Model/groupLOsResponse";
import { Response } from "../../../model/response";

export interface GroupDataAccess {
    getGroupIds: (queryFilter?: Object) => Promise<Response>;
    getGroupLOs: (queryFilter?: Object) => Promise<GroupLOResponse>;
}
