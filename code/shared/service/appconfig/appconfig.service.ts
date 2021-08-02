export interface AppConfigService {
    getConfiguration(configKey: string);
    getGlobalConfiguration(configKey: string);
}
