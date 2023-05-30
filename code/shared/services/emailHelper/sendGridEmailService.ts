import { UtilityService } from "../../utils/utility.service";
import { ConfigHelper } from "../../utils/config.helper";
import { injectable } from "inversify";
import { IEmailMessage, EmailType } from "./sendGridEmailInterfaces";
import { container } from "../../../inversify.config";
import { ServiceBase } from "../serviceBase";
import { TYPES } from "../../inversify/types";
import { IAppSettings } from "../../model/appSettings";

@injectable()
/**
 * API Helper service
 */
export class SendGridEmailService extends ServiceBase {
    private readonly utilityService = container.get<UtilityService>(TYPES.UtilityService);
    private configHelper = container.get<ConfigHelper>(TYPES.ConfigHelper);
    private appSettings: IAppSettings;

    constructor() {
        super();
        this.appSettings = this.configHelper.appSettings;
    }

    /**
     * Sends email
     * @param msg - content of the email
     * @param emailType -  Error or Report
     */
    async sendEmail(msg: IEmailMessage, emailType: EmailType): Promise<void> {
        this.customLogger.info("Begin sendEmail");
        try {
            const sgMail = require("@sendgrid/mail");
            sgMail.setApiKey(this.appSettings.SendGrid_ApiKey);

            if (this.utilityService.convertNullToString(msg?.text) !== "" || this.utilityService.convertNullToString(msg?.html) !== "") {
                if (emailType === EmailType.Error) {
                    if (this.utilityService.convertNullToString(msg.subject) === "") {
                        msg.subject = `${msg.subject} ${this.utilityService.getTodaysDate()}`;
                    }
                } else if (emailType === EmailType.Report) {
                    if (this.utilityService.convertNullToString(msg.subject) === "") {
                        msg.subject = `${msg.subject} ${this.utilityService.getTodaysDate()}`;
                    }
                }
                const response = await sgMail.send(msg);
                if (response?.length > 0 && response[0].statusCode === 202) {
                    this.customLogger.info("Email sent successfully.");
                } else {
                    const errMsg = `An error occured when sending email. Response: ${response}`;
                    this.customLogger.info(errMsg);
                    throw new Error(errMsg);
                }
            }
            this.customLogger.info("End sendEmail");
        } catch (error) {
            if (error.response) {
                this.customLogger.error(error.response.body, error);
            } else {
                this.customLogger.error("sendEmail", error);
            }
        }
    }
}

