import { IntegrationType } from "../dataLake/dataLakeService";
import { EmailType } from "./sendGridEmailInterfaces";
import { SendGridEmailService } from "./sendGridEmailService";
import { IAppSettings } from "../../model/appSettings";
import { ConfigHelper } from "../../utils/config.helper";
import { UtilityService } from "../../utils/utility.service";
import { DataLakeService } from "../dataLake/dataLakeService";
import { ServiceBase } from "../serviceBase";
import { container } from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { IEmailMessage } from "./sendGridEmailInterfaces";

export class MarketingEmailService extends ServiceBase {
    private readonly dataLakeService = container.get<DataLakeService>(TYPES.DataLakeService);
    private readonly utilityService = container.get<UtilityService>(TYPES.UtilityService);
    private readonly sendGridEmailService = container.get<SendGridEmailService>(TYPES.SendGridEmailService);
    private configHelper = container.get<ConfigHelper>(TYPES.ConfigHelper);
    private appSettings: IAppSettings;
    private integrationType;

    constructor() {
        super();
        this.appSettings = this.configHelper.appSettings;
    }

    async sendMarketingEmail(integrationType: IntegrationType): Promise<any> {
        let deltas;
        let fileName, folderPath;
        try {
            this.customLogger.info("Begin sendMarketingEmail");
            this.integrationType = integrationType;

            folderPath = `${this.appSettings[`Datalake_${integrationType}_Folder`]}`;
            fileName = `${integrationType.toLocaleLowerCase()}_deltas.json`;

            if (integrationType === IntegrationType.TotalExpert) {
                fileName = "totalExpert_deltas.json";
            }

            deltas = await this.dataLakeService.getFile(folderPath, fileName);
            await this.sendEmail(deltas);

            this.customLogger.info("End sendMarketingEmail");
        } catch (error) {
            this.customLogger.error("Error in sendMarketingEmail", error);
            throw error;
        }
        return true;
    }

    private async sendEmail(deltas) {
        try {
            this.customLogger.info("Begin sendEmail");
            if (deltas) {
                const html = await this.getHtml(deltas);
                await this.utilityService.saveFileLocally(html, "email.html");

                const emailMessage: IEmailMessage = {
                    to: [this.appSettings[`${this.integrationType}_Email_Report_To`]],
                    from: this.appSettings[`${this.integrationType}_Email_Report_From`],
                    subject: this.appSettings[`${this.integrationType}_Email_Report_Subject`],
                    html,
                };

                if (html?.length > 0) {
                    await this.sendGridEmailService.sendEmail(emailMessage, EmailType.Report);
                }
            }
            this.customLogger.info("End sendEmail");
        } catch (error) {
            this.customLogger.error("Error in sendEmail", error);
            throw error;
        }
        return true;
    }

    private async getHtml(deltas) {
        let html = [];
        try {
            this.customLogger.info("Begin getHtml");
            html.push(`<html>
                        <body>
                            <style>
                                table,
                                th,
                                td {
                                    border: 1px solid #8ebf42;
                                    border-collapse: collapse;
                                    padding: 5px !important;
                                    white-space: nowrap;
                                }

                                span {
                                    margin-bottom: 10px !important;
                                    font-size: 16px;
                                    font-weight: bold;
                                }

                                .error {
                                    color: red;
                                }

                                .id {
                                    width: 300px;
                                }

                                .email {
                                    width: 350px;
                                }

                                .action {
                                    width: 100px;
                                }
                            </style>
                    `);

            if (deltas.archives.count === 0 && deltas.additions.count === 0 && deltas.updates.count === 0) {
                html.push(`<span>No Errors/Updates when Syncing Workday users to ${this.integrationType}</span>`);
            } else {
                const updatesCount = deltas.archives.count + deltas.additions.count + deltas.updates.count;
                html.push(`<span>The following (${updatesCount}) user(s) have updated on ${this.integrationType}.</span><br /><br /><table>`);
                if (updatesCount > 0) {
                    html.push(`<tr>
                                <th class="action">Action</th>
                                <th class="email">Email Address</th>
                                <th class="">Changes</th>
                            </tr>
                        `);
                    html.push(this.iterateData(deltas.archives.changes));
                    html.push(this.iterateData(deltas.additions.changes));
                    html.push(this.iterateData(deltas.updates.changes));
                    html.push("</table>");
                }
                html.push(`<br /><br /><br /><br /> </body></html>`);
            }
            this.customLogger.info("End getHtml");
        } catch (error) {
            this.customLogger.error("Error in getHtml", error);
            throw error;
        }
        return html.join("");
    }

    private iterateData(changes) {
        const html = [];
        try {
            if (changes && changes.length > 0) {
                changes = changes.sort((a, b) => a.action.localeCompare(b.action) || a.emailAddr.localeCompare(b.emailAddr));
                changes.forEach((o) => {
                    html.push(` <tr>
                                    <td class="action">${o.action || ""}</td>
                                    <td class="email">${o.emailAddr || ""}</td>
                                    <td class="">${o.changes ? JSON.stringify(o.changes) : ""}</td>
                                </tr>
                            `);
                });
            }
        } catch (error) {
            this.customLogger.error("Error in iterateData", error);
            throw error;
        }
        return html.join("");
    }
}
