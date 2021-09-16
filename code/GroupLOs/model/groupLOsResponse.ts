import { Response } from "../../shared/model/response";

export class GroupLOResponse implements Response {
    data: GroupLO[];
    Error: boolean;
}

export interface GroupLO {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
}
