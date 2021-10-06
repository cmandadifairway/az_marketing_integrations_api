import { Response } from "../../shared/model/response";
import { LoanOfficer } from "./LoanOfficer";

export class RelationshipResponse implements Response {
    data: Relationship[] | string | string[];
    Error: boolean;
}
export type Relationship = {
    name: string;
    loEmail: string;
    role: string;
};
export type RelationshipDao = {
    loEmail: string;
    role: string;
    inviteDT: Date;
};
export type AccountDao = {
    relationship: { relationships: RelationshipDao[] };
    LoanOfficer: LoanOfficer[];
};
export type AccountUser = {
    inviterName: string;
    inviterFirstName: string;
    inviterLastName: string;
    inviterEmailAddress: string;
    inviteeName: string;
    inviteeEmailAddress: string;
    inviteeRole: string;
    inviteeRoleDesc: string;
};
