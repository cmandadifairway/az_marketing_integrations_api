export interface AppConfigService {
    getConfiguration(configKey: string): string;
    getDefaultFromEmailAddress(): string;
}
