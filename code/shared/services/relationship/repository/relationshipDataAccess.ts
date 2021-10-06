import { DataAccessBase } from "../../dataAccessBase";
import { AccountUser } from "./../../../model/relationship";
import { LoanOfficer } from "./../../../model/LoanOfficer";
import { LoanOfficerService } from "./../../../../shared/services/loanOfficer/loanOfficerService";
import { InviteUserRequest } from "../../../../InviteUser/Model/inviteUserRequest";
import { ReadPreference } from "mongodb";
import { TYPES } from "../../../inversify/types";
import { RemoveInvitedUserRequest } from "../../../../RemoveInvitedUser/Model/removeInvitedUserRequest";
import { Role } from "../../../model/roles";
import { AccountDao, Relationship, RelationshipDao, RelationshipResponse } from "../../../model/relationship";

export interface RelationshipDataService {
    inviteUser(inviteUserRequest: InviteUserRequest): Promise<RelationshipResponse>;
    removeInvitedUser(removeRequest: RemoveInvitedUserRequest): Promise<RelationshipResponse>;
    getInvitedUsers(loEmail: string): Promise<RelationshipResponse>;
    getAccounts(loEmail: string): Promise<any>;
    getAccountPrivileges(): Promise<Role[]>;
    checkInvitee(inviterEmailId: string, inviteeEmailId: string): Promise<RelationshipResponse>;
    getAccountUserDetails(inviteUserRequest: InviteUserRequest): Promise<AccountUser>;
}

export class RelationshipDataAccess extends DataAccessBase implements RelationshipDataService {
    private readonly loanOfficerService = this.resolve<LoanOfficerService>(TYPES.LoanOfficerService);

    async inviteUser(inviteUserRequest: InviteUserRequest): Promise<RelationshipResponse> {
        let response: RelationshipResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const updateQuery = this.buildAddAccountUserQuery(inviteUserRequest);
            const result = await db
                .collection("relationship")
                .updateOne({ partitionKey: inviteUserRequest.inviter }, updateQuery, { upsert: true });
            let msg = "Successfully added new user to the account.";
            if (result.modifiedCount < 1 && result.upsertedCount < 1) {
                msg = "No user was added.";
                this.customLogger.info(msg);
            }
            response = { data: msg, Error: false };
        } catch (error) {
            this.customLogger.error("Error while adding user to the account", error);
            throw error;
        }
        return response;
    }

    async removeInvitedUser(removeRequest: RemoveInvitedUserRequest): Promise<RelationshipResponse> {
        let response: RelationshipResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const updateQuery = this.buildRemoveAccountUserQuery(removeRequest);
            const result = await db
                .collection("relationship")
                .updateOne({ partitionKey: removeRequest.inviter }, updateQuery);
            let msg = "Successfully removed user from the account.";
            if (result.modifiedCount < 1) {
                msg = "No user was removed.";
                this.customLogger.info(msg);
            }
            response = { data: msg, Error: false };
        } catch (error) {
            const errorMsg = `Error while removing ${removeRequest.invitee} user privileges from ${removeRequest.inviter} in db`;
            this.customLogger.error(errorMsg, error);
            throw error;
        }
        return response;
    }

    async getAccountPrivileges(): Promise<Role[]> {
        let arrRoles: Role[] = [];
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const roles = await db
                .collection("relationship", {
                    readPreference: ReadPreference.SECONDARY_PREFERRED,
                })
                .find({ partitionKey: "roles" })
                .project<Role>({ _id: 0, roles: 1 })
                .toArray();
            if (roles?.length > 0) {
                arrRoles = roles[0]["roles"];
            }
            return arrRoles;
        } catch (error) {
            this.customLogger.error("Error while getting account privileges from db", error);
            throw error;
        }
    }

    async getAccounts(loEmail: string): Promise<AccountDao[]> {
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const relationships = await db
                .collection("relationship", {
                    readPreference: ReadPreference.SECONDARY_PREFERRED,
                })
                .aggregate<AccountDao>([
                    { $project: { _id: 0, relationship: "$$ROOT" } },
                    {
                        $lookup: {
                            from: "LoanOfficer",
                            localField: "relationship._id",
                            foreignField: "_id",
                            as: "LoanOfficer",
                        },
                    },
                    { $match: { "relationship.relationships.loEmail": loEmail } },
                ])
                .toArray();

            return relationships;
        } catch (error) {
            this.customLogger.error(`Error while trying to get accounts from db that have access to ${loEmail}`, error);
            throw error;
        }
    }

    async getAccountUserDetails(inviteUserRequest: InviteUserRequest): Promise<AccountUser> {
        try {
            let roleDesc = "";

            if (inviteUserRequest.role !== "") {
                const roles = await this.getAccountPrivileges();
                roleDesc = roles?.find((o) => o.name === inviteUserRequest.role).desc;
            }

            const inviter: LoanOfficer = (await this.loanOfficerService.getLoanOfficer(inviteUserRequest.inviter)).data;
            const invitee: LoanOfficer = (await this.loanOfficerService.getLoanOfficer(inviteUserRequest.invitee)).data;

            const accountUser: AccountUser = {
                inviterName: `${inviter.firstName} ${inviter.lastName}`,
                inviterFirstName: inviter.firstName,
                inviterLastName: inviter.lastName,
                inviterEmailAddress: inviter._id,
                inviteeName:
                    invitee?.firstName && invitee?.lastName
                        ? `${invitee.firstName} ${invitee.lastName}`
                        : inviteUserRequest.invitee,
                inviteeEmailAddress: inviteUserRequest.invitee,
                inviteeRole: inviteUserRequest.role,
                inviteeRoleDesc: roleDesc,
            };
            return accountUser;
        } catch (error) {
            this.customLogger.error("Error while getting details necessary for sending relationship email", error);
            throw error;
        }
    }

    async getInvitedUsers(loEmail: string): Promise<RelationshipResponse> {
        let response: RelationshipResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const result = await db
                .collection("relationship", { readPreference: ReadPreference.SECONDARY_PREFERRED })
                .findOne({ partitionKey: loEmail }, { projection: { relationships: 1 } });
            let relationships: RelationshipDao[];
            if (result) {
                relationships = result.relationships;
            }

            let finalRelationships: Relationship[] = [];
            for (let relationship of relationships) {
                const loEmail = relationship["loEmail"];
                const lo = await db
                    .collection("LoanOfficer", { readPreference: ReadPreference.SECONDARY_PREFERRED })
                    .findOne({ partitionKey: loEmail });

                let name = "";
                if (lo) {
                    name = `${lo.firstName} ${lo.lastName}`;
                }
                finalRelationships.push({
                    name,
                    loEmail,
                    role: relationship.role,
                });
            }

            response = { data: finalRelationships, Error: false };
        } catch (error) {
            this.customLogger.error(`Error while trying to get users ${loEmail} has access to`, error);
            throw error;
        }
        return response;
    }

    async checkInvitee(inviterEmailId: string, inviteeEmailId: string): Promise<RelationshipResponse> {
        let response: RelationshipResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const document = await db
                .collection("relationship", {
                    readPreference: ReadPreference.SECONDARY_PREFERRED,
                })
                .findOne({ partitionKey: inviterEmailId, "relationships.loEmail": inviteeEmailId });

            if (document) {
                response = { data: "Found invitee", Error: false };
            }
        } catch (error) {
            this.customLogger.error("getInvitedUsers", error);
            throw error;
        }
        return response;
    }

    private buildAddAccountUserQuery(inviteUserRequest: InviteUserRequest): object {
        const relationships = {
            loEmail: inviteUserRequest.invitee,
            role: inviteUserRequest.role,
            inviteDT: new Date(Date.now()),
        };
        return {
            $push: { relationships },
            $setOnInsert: {
                _id: inviteUserRequest.inviter,
                partitionKey: inviteUserRequest.inviter,
            },
        };
    }

    private buildRemoveAccountUserQuery(removeRequest: RemoveInvitedUserRequest): object {
        return {
            $pull: { relationships: { loEmail: removeRequest.invitee } },
        };
    }
}
