import { container } from "../../inversify.config";
import { ServiceBase } from "../services/serviceBase";
import { TYPES } from "../inversify/types";
import { KeyVaultService } from "../services/keyVault/keyVault.service";
import { IAppSettings } from "../model/appSettings";

/**
 * Helper class for getting App Settings
 */

export class ConfigHelper extends ServiceBase {
    public appSettings: IAppSettings;

    private keys = [
        "Datalake_Account_Name",
        "DataLake--AccountKey",
        "Datalake_Mktg_Integrations_Folder_Path",
        "Datalake_Flowapi_Folder",
        "Datalake_MailChimp_Folder",
        "Datalake_TotalExpert_Folder",
        "Datalake_Workfront_Folder",
        "MailChimp_Api_Base_Url",
        "MailChimp_List_Id",
        "MailChimp_Operation_Id",
        "SendGrid--ApiKey",
        "MailChimp_Email_Error_To",
        "MailChimp_Email_Error_Subject",
        "MailChimp_Email_Report_To",
        "MailChimp_Email_Report_From",
        "MailChimp_Email_Report_Subject",
        "Inactive_Users_Days_Ago",
        "Workfront_Email_Error_To",
        "Workfront_Email_Error_Subject",
        "Workfront_Email_Report_To",
        "Workfront_Email_Report_From",
        "Workfront_Email_Report_Subject",
        "TotalExpert_Email_Error_To",
        "TotalExpert_Email_Error_Subject",
        "TotalExpert_Email_Report_To",
        "TotalExpert_Email_Report_From",
        "TotalExpert_Email_Report_Subject",
        "WebData_Url",
    ];
    async setAppSettings(): Promise<void> {
        await this.getAppSettings();
    }
    /**
     * Gets application settings
     */
    private async getAppSettings(): Promise<IAppSettings> {
        if (this.appSettings === null || this.appSettings === undefined) {
            this.appSettings = {};
            for await (const key of this.keys) {
                this.appSettings[key.replace("--", "_")] = await this.getConfigValue(key);
            }
            const Datalake_Mktg_Integrations_Folder_Path = this.appSettings.Datalake_Mktg_Integrations_Folder_Path;
            this.appSettings.Datalake_Flowapi_Folder = `${Datalake_Mktg_Integrations_Folder_Path}${this.appSettings.Datalake_Flowapi_Folder}`;
            this.appSettings.Datalake_MailChimp_Folder = `${Datalake_Mktg_Integrations_Folder_Path}${this.appSettings.Datalake_MailChimp_Folder}`;
            this.appSettings.Datalake_Workfront_Folder = `${Datalake_Mktg_Integrations_Folder_Path}${this.appSettings.Datalake_Workfront_Folder}`;
            this.appSettings.Datalake_TotalExpert_Folder = `${Datalake_Mktg_Integrations_Folder_Path}${this.appSettings.Datalake_TotalExpert_Folder}`;
        }
        return this.appSettings;
    }

    async getConfigValue(configKey: string): Promise<string> {
        let configurationValue: string = process.env[configKey];
        if (configurationValue) {
            this.customLogger.info(`APPINFO:: fetching config from app configuration. Key: ${configKey}, Value: ${configurationValue}`);
            return configurationValue;
        } else {
            // try getting the config from key vault
            const keyVaultService = container.get<KeyVaultService>(TYPES.KeyVaultService);
            this.customLogger.info("Try getting value from KeyVault");
            configurationValue = await keyVaultService.getSecretValue(configKey);
            this.customLogger.trace(`Keyvault Key: ${configKey}, value: ${configurationValue}`);
            return configurationValue;
        }
    }
}
