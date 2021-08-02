import { AppConfigurationClient, GetConfigurationSettingResponse } from "@azure/app-configuration";
import { ManagedIdentityCredential } from "@azure/identity";
import { AppConfigService } from "./appconfig.service";
import { injectable } from "inversify";
import container from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { CustomLogger } from "../../utils/customLogger.service";
import { ErrorHandlerService } from "../exception/errorHandler.service";
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
    private readonly baseErrorHandler = container.get<ErrorHandlerService>(TYPES.BaseErrorHandler);

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
            this.logger.trace(`fetched configuration value from env ${configurationValue}`);
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
            this.logger.trace(`From AppConfigServiceImpl getConfigurationFromEndpoint::
		 config key - ${configKey},label-${label} config  - ${JSON.stringify(settings)}`);
            configurationValue = settings.value;
            this.logger.trace(`From AppConfigServiceImpl getConfigurationFromEndpoint::
		 config key - ${configKey},label-${label} config Value - ${configurationValue}`);
        } catch (error) {
            this.baseErrorHandler.handleError(
                error,
                `error in AppConfigServiceImpl.getConfigurationFromEndpoint
			while getting appconfig for endpoint: ${endpoint}  , key ${configKey} , label ${label}`
            );
        }

        return configurationValue;
    }
}
