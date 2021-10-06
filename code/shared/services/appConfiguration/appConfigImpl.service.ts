import { ConfigBase } from "../serviceBase";
import { AppConfigService } from "./appconfig.service";

export class AppConfigServiceImpl extends ConfigBase implements AppConfigService {
    getConfiguration(configKey: string): string {
        let configurationValue: string = process.env[configKey] || "";
        return configurationValue;
    }

    getDefaultFromEmailAddress(): string {
        return this.getConfiguration("Default_From_Email_Address");
    }
}
