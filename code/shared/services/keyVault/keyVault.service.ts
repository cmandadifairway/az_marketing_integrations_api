export interface KeyVaultService {
    getSecretValue(secretName: string): Promise<string>;
}
