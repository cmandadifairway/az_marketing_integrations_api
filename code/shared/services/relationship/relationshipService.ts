import { ServiceBase } from "../serviceBase";
import { EmailService, EmailMessage } from "./../../../SendEmail/service/Email.service";
import { AccountUser } from "./../../model/relationship";
import { TYPES } from "../../inversify/types";
import { RelationshipDataService } from "./repository/relationshipDataAccess";
import { Response } from "../../model/response";
import { InviteUserRequest } from "../../../InviteUser/Model/inviteUserRequest";
import { RemoveInvitedUserRequest } from "../../../RemoveInvitedUser/Model/removeInvitedUserRequest";
import { RelationshipResponse, Relationship, RelationshipDao, AccountDao } from "../../model/relationship";
import { LoanOfficer } from "../../model/LoanOfficer";
import { Role } from "../../model/roles";
import { RelationshipHtmlService } from "./relationshipEmailHelper";
import { AppConfigService } from "../appConfiguration/appConfig.service";

export interface RelationshipService {
    inviteUser: (inviteUserRequest: InviteUserRequest) => Promise<RelationshipResponse>;
    removeInvitedUser: (removeRequest: RemoveInvitedUserRequest) => Promise<RelationshipResponse>;
    getInvitedUsers: (loEmail: string) => Promise<RelationshipResponse>;
    getAccounts: (loEmail: string) => Promise<RelationshipResponse>;
    getAccountPrivileges: () => Promise<Response>;
    checkInvitee(inviterEmailId: string, inviteeEmailId: string): Promise<RelationshipResponse>;
    sendEmail(
        userRelationShipEmailType: UserRelationShipEmailType,
        inviteUserRequest: InviteUserRequest
    ): Promise<Response>;
}

export class Relationships extends ServiceBase implements RelationshipService {
    private readonly accountUsersDataService = this.resolve<RelationshipDataService>(TYPES.RelationshipDataService);
    private readonly emailService = this.resolve<EmailService>(TYPES.EmailServiceImpl);
    private readonly appConfigService = this.resolve<AppConfigService>(TYPES.AppConfigService);
    private readonly relationshipHtmlService = this.resolve<RelationshipHtmlService>(TYPES.RelationshipHtmlService);

    async inviteUser(inviteUserRequest: InviteUserRequest): Promise<RelationshipResponse> {
        return this.accountUsersDataService.inviteUser(inviteUserRequest);
    }

    async removeInvitedUser(removeRequest: RemoveInvitedUserRequest): Promise<RelationshipResponse> {
        return this.accountUsersDataService.removeInvitedUser(removeRequest);
    }

    async getAccountPrivileges(): Promise<Response> {
        const roles = await this.accountUsersDataService.getAccountPrivileges();
        if (roles.length > 0) {
            const index = roles?.findIndex((x: Role) => x?.name === "admin");
            if (index > -1) {
                roles.splice(index, 1);
            }
        }
        return { data: roles, Error: false };
    }

    async getAccounts(loEmail: string): Promise<RelationshipResponse> {
        let userAccountsResponse: RelationshipResponse;
        const userAccounts: Relationship[] = [];
        try {
            const arrAccount = await this.accountUsersDataService.getAccounts(loEmail);
            if (arrAccount) {
                arrAccount.forEach((account: AccountDao) => {
                    const relationships: RelationshipDao[] = account.relationship.relationships;
                    const loanOfficer: LoanOfficer = account.LoanOfficer[0];
                    const role = relationships.find((o: RelationshipDao) => o.loEmail === loEmail);

                    let accountUser: Relationship = {
                        loEmail: loanOfficer._id,
                        name: `${loanOfficer.firstName} ${loanOfficer.lastName}`,
                        role: role?.role,
                    };
                    userAccounts.push(accountUser);
                });
            }
            userAccountsResponse = { data: userAccounts, Error: false };
        } catch (error) {
            this.customLogger.error("Error while deriving account data based upon db response", error);
            throw error;
        }
        return userAccountsResponse;
    }

    async getInvitedUsers(loEmail: string): Promise<RelationshipResponse> {
        return this.accountUsersDataService.getInvitedUsers(loEmail);
    }

    async checkInvitee(inviterEmailId: string, inviteeEmailId: string): Promise<RelationshipResponse> {
        return this.accountUsersDataService.checkInvitee(inviterEmailId, inviteeEmailId);
    }

    async sendEmail(
        userRelationShipEmailType: UserRelationShipEmailType,
        inviteUserRequest: InviteUserRequest
    ): Promise<Response> {
        try {
            const accountUser: AccountUser = await this.accountUsersDataService.getAccountUserDetails(
                inviteUserRequest
            );

            let subject = `${accountUser.inviterName} has invited you to access their FairwayFirst account`;

            if (userRelationShipEmailType === UserRelationShipEmailType.removedInvitee) {
                subject = `${accountUser.inviterName} has removed your access to their FairwayFirst account`;
            }

            const html = await this.relationshipHtmlService.getHtml(userRelationShipEmailType, accountUser);

            const emailMessage: EmailMessage = {
                from: this.appConfigService.getDefaultFromEmailAddress(),
                to: inviteUserRequest.invitee,
                subject,
                html,
            };

            this.customLogger.info(
                `Trigger sendEmail for ${userRelationShipEmailType} email: ${inviteUserRequest.invitee} from ${inviteUserRequest.inviter}`
            );
            return this.emailService.sendEmail(emailMessage);
        } catch (error) {
            this.customLogger.error(
                `Error while sending ${userRelationShipEmailType} email: ${inviteUserRequest.invitee} from ${inviteUserRequest.inviter}`,
                error
            );
            throw error;
        }
    }
}
