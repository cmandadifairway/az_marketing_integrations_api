import { ServiceBase } from "../serviceBase";
import { TYPES } from "../../inversify/types";
import { AccountUser } from "../../model/relationship";
import { UtilityService } from "../../utils/utility.service";

export interface RelationshipHtmlService {
    getHtml(templateType: string, accountUser: AccountUser): Promise<string>;
}

export class RelationshipEmailHelper extends ServiceBase implements RelationshipHtmlService {
    private readonly utility = this.resolve<UtilityService>(TYPES.UtilityService);

    public async getHtml(templateType: string, accountUser: AccountUser): Promise<string> {
        let body = "";
        switch (templateType) {
            case UserRelationShipEmailType.inviteeIsNotFairywayUser:
                body = await this.inviteeIsNotFairwayUser(accountUser);
                break;
            case UserRelationShipEmailType.inviteeIsFairywayUser:
                body = this.inviteeIsFairwayUser(accountUser);
                break;
            case UserRelationShipEmailType.removedInvitee:
                body = this.inviteeIsRemoved(accountUser);
                break;
            default:
                break;
        }

        const htmlHeader = await this.getHeader(accountUser.inviteeName);
        const htmlFooter = this.getFooter(accountUser.inviterName, accountUser.inviterEmailAddress);

        return `${htmlHeader}${body}${htmlFooter}`;
    }

    private inviteeIsRemoved(accountUser: AccountUser): string {
        return `<p>${accountUser.inviterName} has removed your access to their FairwayFirst account. You will no longer be able to view and/or edit information in their account.</p>`;
    }

    private inviteeIsFairwayUser(accountUser: AccountUser): string {
        return `<p>${accountUser.inviterName} has invited you to access their FairwayFirst account.</p>
                <p>${accountUser.inviterFirstName} has granted you ${accountUser.inviteeRole} access. With ${accountUser.inviteeRole}, you will:</p>

                <p><ul><li>${accountUser.inviteeRoleDesc}</li></ul></p>

                <p>In order to access ${accountUser.inviterName}’s account:</p>
                <ul>
                <li>Open the FairwayFirst app</li>
                <li>Go to User Settings</li>
                <li>Go to Account Access</li>
                <li>Select ${accountUser.inviterName}’s name from the list.</li>
                </ul>`;
    }

    private async inviteeIsNotFairwayUser(accountUser: AccountUser): Promise<string> {
        const getStartedButton_Base64 = await this.utility.getFileFromBlobStorage("GetStarted.png");
        return `<p>${accountUser.inviterName} has invited you to access their FairwayFirst account.</p>
                <p>${accountUser.inviterFirstName} has granted you ${accountUser.inviteeRole} access. With ${accountUser.inviteeRole}, you will:</p>
                <p><ul><li>${accountUser.inviteeRoleDesc}</li></ul></p>
                <p>In order to access ${accountUser.inviterName}’s account, you will need to sign up for your own FairwayFirst account. </p>
                <p>Click on the “Get Started” button below to start the process:</p>
                <div style="text-align: center;width:100% important;">
                <a href="https://fairwayfirst.io/sign-up-page.html" aria-current="page">
                    <img src="data:image/jpeg;base64,${getStartedButton_Base64}"
                    alt="" style="max-width: 230px;"/>
                </a>
                </div>
                <br />`;
    }

    private async getHeader(inviteeName: string): Promise<string> {
        const fairwayHeaderLogo_Base64 = await this.utility.getFileFromBlobStorage("FairwayFirstLogo.png");
        return `<!DOCTYPE html>
                <html>
                    <head>
                    <meta charset="utf-8">
                    <title>FairwayFirst</title>

                    </head>

                    <body style="width: 800px;margin: 10px;">
                    <div style="width: 800px;text-align:center;">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="data:image/jpeg;base64,${fairwayHeaderLogo_Base64}"
                            alt="" style="width: 200px;height: 66px;">
                    </div>
                    <div style="float: left;">
                    <p>Dear ${inviteeName},</p>`;
    }

    private getFooter(inviterName: string, inviterEmail: string): string {
        return `<p>
                If you believe you have gotten this email in error, please contact ${inviterName}
                (${inviterEmail}) in order to clarify.</p>
                <p>If you have any other questions, please reach out to support@fairwayfirst.io.</p>
                <p>Best,<br />
                FairwayFirst Team</p>
                </p>
                </div>
                </div>
                </body>
                </html>`;
    }
}
