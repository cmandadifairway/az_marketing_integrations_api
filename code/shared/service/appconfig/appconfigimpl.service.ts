import { AppConfigurationClient, GetConfigurationSettingResponse } from "@azure/app-configuration";
import { ManagedIdentityCredential } from "@azure/identity";
import { AppConfigService } from "./appconfig.service";
import { injectable } from "inversify";
import { container } from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { CustomLogger } from "../../utils/customLogger.service";

/*
 * This class will help to get the properties from app config.
 * app config endpoints needs to be configured in app settings and ManagedIdentity permission should be provided to connect.
 * Contact cloudinfra@fairwaymc.com /VeronicaP@fairwaymc.com to have primary and secondary end points configured in function app settings.
 * Ex- For global - global-config-endpoint,global-config-endpoint-secondary
 * For project specific - app-config-endpoint ,app-config-endpoint-secondary
 */
@injectable()
export class AppConfigServiceImpl implements AppConfigService {
    private readonly logger = container.get<CustomLogger>(TYPES.CustomLogger);

    async getGlobalConfiguration(configKey: string): Promise<string> {
        this.logger.trace(`getGlobalConfiguration Value Method Initiated with appconfig configKey ${configKey}`);
        return this.getconfig(configKey, true);
    }
    async getConfiguration(configKey: string): Promise<string> {
        this.logger.trace(`getConfiguration Value Method Initiated with appconfig configKey ${configKey}`);
        return this.getconfig(configKey, false);
    }

    private async getconfig(configKey: string, isGlobal: boolean): Promise<string> {
        this.logger.trace(`getConfig Value Method Initiated with appconfig configKey ${configKey}`);
        let configurationValue: string = await this.getLocalConfiguration(configKey);
        if (configurationValue) {
            this.logger.trace(`fetched configuration value from env for ${configKey}`);
        } else {
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
                    `configurationValue not found in primaryEndpoint ${primaryEndpoint}. Try to fetch from secondary endpoint ${secondaryEndpoint}`
                );
                configurationValue = await this.getConfigurationFromEndpoint(secondaryEndpoint, configKey);
            }
        }
        return configurationValue;
    }
    private async getLocalConfiguration(configKey: string): Promise<string> {
        const configurationValue: string = process.env[configKey];
        this.logger.trace(`From AppConfigServiceImpl getLocalConfiguration::
		config key - ${configKey}, config Value - ${configurationValue}`);
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
            this.logger.error(`error in AppConfigServiceImpl.getConfigurationFromEndpoint while getting key ${configKey}`, error);
        }

        return configurationValue;
    }
}
