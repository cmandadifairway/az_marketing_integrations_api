import { GroupLOResponse } from "./../../../../GroupLOs/Model/groupLOsResponse";
import { Response } from "../../../model/response";

export interface GroupDataAccess {
    getGroupIds: () => Promise<Response>;
    getGroupLOs: (queryFilter?: Object) => Promise<GroupLOResponse>;
}
