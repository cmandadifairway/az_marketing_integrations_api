import { HomeBirdResponse } from "./../model/homeBirdResponse";
import axios, { AxiosResponse } from "axios";
import { ServiceBase } from "../../shared/services/serviceBase";
import { SendToHomeBirdService } from "./SendToHomeBird.service";
import { Referral } from "../../shared/model/referral";
import { TYPES } from "../../shared/inversify/types";
import { Response } from "../../shared/model/response";
import { LoanOfficerDataService } from "../../shared/services/loanOfficer/repository/loanOfficerDataAccess";
import { LeadDataService } from "../../shared/services/leads/repository/leadDataAccess";
import { KeyVaultService } from "../../shared/services/keyVault/keyVault.service";
import { HomeBirdRequest } from "../model/homeBirdRequest";
import { CheckUserInput, SendLeadInput } from "../model/request.model";
import { LoanOfficerResponse } from "../../shared/model/loanOfficerResponse";

export class SendToHomeBirdImpl extends ServiceBase implements SendToHomeBirdService {
    private readonly loDataService = this.resolve<LoanOfficerDataService>(TYPES.LoanOfficerDataService);
    private readonly leadDataService = this.resolve<LeadDataService>(TYPES.LeadDataService);
    private readonly keyVaultService = this.resolve<KeyVaultService>(TYPES.KeyVaultService);

    private readonly contentType = "application/json";

    async sendToHomeBirdService(data: HomeBirdRequest): Promise<Response> {
        const loResponse: LoanOfficerResponse = await this.loDataService.getLoanOfficer(
            { partitionKey: data.loEmail },
            false
        );
        const loanOfficer = loResponse?.data || null;
        // LO last name is optional
        const checkUserInput: CheckUserInput = {
            email: data.loEmail,
            first_name: data.loFirstName,
            last_name: loanOfficer?.lastName || "",
            create_user: true,
        };

        const leadResponse = await this.leadDataService.getLead({ partitionKey: data.leadId }, true);
        const lead = leadResponse.data;

        const checkUserResponse = await this.checkUser(checkUserInput);
        const homebirdUser = checkUserResponse.data;
        this.customLogger.info(
            "APPINFO::Checked user " + data.loEmail + " Homebird status: " + homebirdUser.data.result
        );

        const homebirdLoID = homebirdUser.data.access_token.key;

        const sendLeadInput: SendLeadInput = {
            loID: homebirdLoID,
            first_name: lead.firstName,
            last_name: lead.lastName,
            email: lead.email,
            mobile_phone: lead.phone,
        };

        this.customLogger.info(
            "APPINFO::Sending lead " + data.leadId + " from LO email " + data.loEmail + " to Homebird"
        );

        await this.sendLead(sendLeadInput);

        const updateQuery: object = this.updateQueryBuilder();
        await this.leadDataService.updateLead(data.leadId, updateQuery);

        const homeBirdResponse: HomeBirdResponse = { success: true, leadId: data.leadId };

        return {
            data: homeBirdResponse,
            Error: false,
        };
    }

    private async getKeyandUrl() {
        try {
            const key = await this.keyVaultService.getSecretValue("HOMEBIRD--KEY");
            const url = await this.keyVaultService.getSecretValue("HOMEBIRD--URL");
            return {
                key: key,
                url: url,
            };
        } catch (error) {
            this.customLogger.error("Error while getting the key for Homebird", error);
            throw error;
        }
    }

    private async checkUser(checkUserInput: CheckUserInput) {
        const homebirdConfig = await this.getKeyandUrl();
        const baseUrl = homebirdConfig.url;
        const key = homebirdConfig.key;
        let response: AxiosResponse<any>;
        try {
            const url = baseUrl + "/users/check?access_token=" + key;
            const data = JSON.stringify(checkUserInput, (_key, value) => {
                if (value !== null) return value;
            });

            response = await axios.post(url, data, { headers: { "Content-Type": this.contentType } });
        } catch (error) {
            this.customLogger.error("Error checking Homebird user", error);
            throw error;
        }
        return response;
    }

    private async sendLead(sendLeadInput: SendLeadInput) {
        const homebirdConfig = await this.getKeyandUrl();
        const baseUrl = homebirdConfig.url;

        let response: AxiosResponse<any>;
        try {
            const url = baseUrl + "/leads?access_token=" + sendLeadInput.loID;
            const data = JSON.stringify(sendLeadInput, (_key, value) => {
                if (value !== null) return value;
            });

            response = await axios.post(url, data, { headers: { "Content-Type": this.contentType } });
        } catch (error) {
            this.customLogger.error("Error sending Homebird lead", error);
            throw error;
        }
        return response;
    }

    private updateQueryBuilder(): object {
        const getDate = new Date(Date.now()).toISOString();
        const referral: Referral = {
            method: "Homebird",
            referredDT: getDate,
        };
        const updateQuery = {
            $set: { lastUpdated: getDate },
            $push: { referral: referral },
        };
        return updateQuery;
    }
}
