export interface AppConfigService {
    getConfiguration(configKey: string): string;
    getGlobalConfiguration(configKey: string): Promise<string>;
    getSecondaryConfiguration(configKey: string): Promise<string>;
}
