import { AppConfigurationClient, GetConfigurationSettingResponse } from "@azure/app-configuration";
import { ManagedIdentityCredential } from "@azure/identity";
import { AppConfigService } from "./appconfig.service";
import { ServiceBase } from "../serviceBase";

/*
 * This class will help to get the properties from app config.
 * app config endpoints needs to be configured in app settings and ManagedIdentity permission should be provided to connect.
 * Contact cloudinfra@fairwaymc.com /VeronicaP@fairwaymc.com to have primary and secondary end points configured in function app settings.
 * Ex- For global - global-config-endpoint,global-config-endpoint-secondary
 * For project specific - app-config-endpoint ,app-config-endpoint-secondary
 */
export class AppConfigServiceImpl extends ServiceBase implements AppConfigService {
    public async getGlobalConfiguration(configKey: string): Promise<string> {
        return this.getconfig(configKey, true);
    }

    public async getSecondaryConfiguration(configKey: string): Promise<string> {
        return this.getconfig(configKey, false);
    }

    public getConfiguration(configKey: string): string {
        const configurationValue: string = process.env[configKey] || "";
        return configurationValue;
    }

    private async getconfig(configKey: string, isGlobal: boolean): Promise<string> {
        let configurationValue: string = this.getConfiguration(configKey);
        if (!configurationValue) {
            let primaryEndpoint: string;
            let secondaryEndpoint: string;
            if (isGlobal === true) {
                primaryEndpoint = process.env["global-config-endpoint"];
                secondaryEndpoint = process.env["global-config-endpoint-secondary"];
            } else {
                primaryEndpoint = process.env["app-config-endpoint"];
                secondaryEndpoint = process.env["app-config-endpoint-secondary"];
            }
            configurationValue = await this.getConfigurationFromEndpoint(primaryEndpoint, configKey);
            if (!configurationValue) {
                this.logger.warn(
                    "configurationValue not found in primaryEndpoint. Try to fetch from secondary endpoint."
                );
                configurationValue = await this.getConfigurationFromEndpoint(secondaryEndpoint, configKey);
            }
        }
        return configurationValue;
    }

    private async getConfigurationFromEndpoint(endpoint: string, configKey: string): Promise<string> {
        const label: string = process.env["environment"];
        let configurationValue: string;

        try {
            const credential = new ManagedIdentityCredential();
            const client = new AppConfigurationClient(endpoint, credential);
            const settings: GetConfigurationSettingResponse = await client.getConfigurationSetting({
                key: configKey,
                label,
            });
            configurationValue = settings.value;
        } catch (error) {
            this.logger.error(
                `error in AppConfigServiceImpl.getConfigurationFromEndpoint while getting key ${configKey}`,
                error
            );
        }

        return configurationValue;
    }
}
