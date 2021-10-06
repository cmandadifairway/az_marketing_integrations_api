import { ServiceBase } from "../../shared/services/serviceBase";
import { AppConfigService } from "../../shared/services/appConfiguration/appConfig.service";
import { EmailService, EmailMessage } from "./Email.service";
import { TYPES } from "../../shared/inversify/types";
import { UtilityService } from "../../shared/utils/utility.service";
import { KeyVaultService } from "../../shared/services/keyVault/keyVault.service";
import { Response } from "../../shared/model/response";

/**
 * Helper class for sending email
 */
export class EmailServiceImpl extends ServiceBase implements EmailService {
    private readonly appConfigService = this.resolve<AppConfigService>(TYPES.AppConfigService);
    private readonly utility = this.resolve<UtilityService>(TYPES.UtilityService);
    private readonly keyVaultService = this.resolve<KeyVaultService>(TYPES.KeyVaultService);

    /**
     * Sends email using SendGrid library
     * @param msg - content of the email, should be of type IEmailMessage
     * Usage: sendEmail({
                            "from": "no-reply@fairwaymc.com",
                            "to": ["chandra.mandadi@fairwaymc.com","someone@fairwaymc.com"],
                            "subject": "hi",
                            "text": "",
                            "html": "<html>This is test</html>",
                            "attachments": [{"content":"base64 encoded text goes here", "filename": "test","type":"json"} ]
                        })
     * @returns - Promise<Response>
                   { data: "Email sent successfully" success: true }
                   { data: "from cannot be empty", success: false }
     */
    async sendEmail(msg: EmailMessage): Promise<Response> {
        let retVal: Response;
        try {
            this.customLogger.info("Begin sendEmail");
            const sgMail = require("@sendgrid/mail");
            const sendGridApiKey = await this.keyVaultService.getSecretValue("SENDGRID--API--KEY");
            this.removeUnusedProperties(msg);

            // set the to and subject from config
            let to = msg.to ? msg.to.split(",") : [];
            if (to.length <= 0) {
                const supportEmail = this.appConfigService.getConfiguration("Support_Email_To_Address");
                to = supportEmail?.split(",");
            }

            if (this.utility.convertNullToString(msg.subject) === "") {
                msg.subject = this.appConfigService.getConfiguration("Support_Email_Subject");
            }

            sgMail.setApiKey(sendGridApiKey);
            const response = await sgMail.send({ ...msg, to });
            if (response?.length > 0 && response[0].statusCode === 202) {
                retVal = { data: "Email sent successfully", Error: false };
            } else {
                retVal = { data: [JSON.stringify(response)], Error: true };
            }
            this.customLogger.info("End sendEmail", retVal);
        } catch (error) {
            this.customLogger.error("Error when sending email", error);
            throw error;
        }
        return retVal;
    }

    /**
     * Helper method of removing unused properties for the message object
     * @param msg
     */
    private removeUnusedProperties(msg: EmailMessage) {
        if (msg) {
            const keys = Object.keys(msg);
            keys.forEach((key) => {
                if (msg[key] === undefined || msg[key] === null) {
                    this.utility.deleteProperty(msg, key);
                }
            });
        }
        if (msg.attachments?.length === 0) {
            this.utility.deleteProperty(msg, "attachments");
        }
    }
}
