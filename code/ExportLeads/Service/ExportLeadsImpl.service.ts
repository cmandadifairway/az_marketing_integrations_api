import { ServiceBase } from "../../shared/services/serviceBase";
import { AppConfigService } from "./../../shared/services/appConfiguration/appConfig.service";
import { Referral } from "./../../shared/model/referral";
import { LeadNote } from "./../../shared/model/leadNote";
import { UtilityService } from "./../../shared/utils/utility.service";
import { JSONHelper } from "./../../shared/JSON/JSON.Helper";
import { TYPES } from "../../shared/inversify/types";
import { LeadsResponse } from "../../shared/model/leadsResponse";
import { ExportLeadsService } from "./ExportLeads.service";
import { Lead } from "../../shared/model/Lead";
import { EmailService, EmailAttachment, EmailMessage } from "../../SendEmail/service/Email.service";
import { LoanStatus } from "../../shared/model/loanStatus";
import { LeadDataService } from "../../shared/services/leads/repository/leadDataAccess";

export class ExportLeadsServiceImpl extends ServiceBase implements ExportLeadsService {
    private readonly leadDataService = this.resolve<LeadDataService>(TYPES.LeadDataService);
    private readonly jsonHelper = this.resolve<JSONHelper>(TYPES.JSONHelper);
    private readonly utility = this.resolve<UtilityService>(TYPES.UtilityService);
    private readonly emailService = this.resolve<EmailService>(TYPES.EmailServiceImpl);
    private readonly appConfigService = this.resolve<AppConfigService>(TYPES.AppConfigService);
    private readonly errorMessage = "Error occured when exporting leads";

    public async exportLeads(loEmail: string): Promise<void> {
        try {
            const leadsResponse: LeadsResponse = await this.leadDataService.getAllLeads({
                "loanOfficer.loEmail": loEmail,
            });
            // format the data for sending email
            const leads = this.formatLeads(leadsResponse.leads);
            this.EmailLeads(loEmail, leads)
                .then((o) => {})
                .catch((o) => {
                    throw o;
                });
        } catch (error) {
            this.customLogger.error(`${this.errorMessage} for ${loEmail}`, error);
            throw error;
        }
    }

    private formatLeads(leads: Lead[]): any[] {
        let newLeads: any[] = new Array();
        try {
            if (leads?.length > 0) {
                leads.forEach((lead) => {
                    const loanStatus = this.getCurrentLoanStatusAndDate(lead.loanStatus);
                    const referral = this.getReferralMethodAndDate(lead.referral);
                    newLeads.push({
                        // Lead Status	Lead Source	City	Email	First Name	Last Name	Lead Type	Link	Phone
                        // Postal Code	State	Loan Status	Loan Status Date	Note1	Note1 Date	Note2	Note2 Date
                        // Referred Method	Referred Date
                        "Lead Status": lead.currentLeadStatus,
                        "Lead Source": lead.channelWebsite,
                        City: lead.city,
                        Email: lead.email,
                        "First Name": lead.firstName,
                        "Last Name": lead.lastName,
                        "Lead Type": lead.leadType,
                        Link: lead.link,
                        Phone: lead.phone,
                        "Postal Code": lead.postalCode,
                        State: lead.state,
                        "Loan Status": loanStatus[0],
                        "Loan Status Date": loanStatus[1],
                        "Referred Method": referral[0],
                        "Referred Date": referral[1],
                        ...this.getNotes(lead.leadNotes),
                    });
                });
            }
        } catch (error) {
            const errorMsg = "Error while formatting lead data for export";
            this.customLogger.error(errorMsg, error);
            throw new Error(`${errorMsg} - ${error.message}`);
        }
        return newLeads;
    }

    private getReferralMethodAndDate(referral: Referral[]): string[] {
        if (referral?.length > 0) {
            const index = referral.length - 1;
            const method = referral[index].method;
            const dt = this.utility.changeTimezone(referral[index].referredDT);
            if (this.utility.isEqual("homebird", method.toLowerCase())) {
                return ["Network", dt];
            } else {
                return [method, dt];
            }
        }
        return ["", ""];
    }

    private getCurrentLoanStatusAndDate(loanStatus: LoanStatus[]): string[] {
        if (loanStatus) {
            const sortedArray = loanStatus.sort(
                (a, b) => new Date(a.statusDT).getTime() - new Date(b.statusDT).getTime()
            );
            if (sortedArray.length > 0) {
                const dt = sortedArray[sortedArray.length - 1].statusDT;
                return [sortedArray[sortedArray.length - 1].statusName, this.utility.changeTimezone(dt)];
            }
        }
        return ["", ""];
    }

    private getNotes(leadNotes: LeadNote[]): object {
        const notes = {};
        if (leadNotes) {
            for (let index = 0; index < leadNotes.length; index++) {
                const note = leadNotes[index];
                notes[`Note${index + 1}`] = note.note;
                notes[`Note${index + 1} Date`] = this.utility.changeTimezone(note.noteDT);
            }
        }
        return notes;
    }

    private async EmailLeads(loEmail: string, leads: Lead[]): Promise<void> {
        let exportLeadsResponse;
        try {
            const csv = await this.jsonHelper.convertJsonToCSV(leads);
            const streamContents = Buffer.from(csv);
            const base64data = streamContents.toString("base64");
            const today = this.utility.getTodaysDate().replace(/\//g, "-");
            const fileName = `FairwayFirst Leads - ${today}.csv`;

            const attachment: EmailAttachment = {
                content: base64data,
                filename: fileName,
                type: "text/csv",
            };

            const msg: EmailMessage = {
                to: loEmail,
                from: this.appConfigService.getDefaultFromEmailAddress(),
                attachments: [attachment],
                text: " ",
                subject: fileName.replace(".csv", ""),
            };

            this.emailService
                .sendEmail(msg)
                .then((o) => {})
                .catch((o) => {
                    throw o;
                });
        } catch (error) {
            const errorMsg = "Error while emailing lead export";
            this.customLogger.error(errorMsg, error);
            throw new Error(`${errorMsg} - ${error.message}`);
        }
        return exportLeadsResponse;
    }
}
