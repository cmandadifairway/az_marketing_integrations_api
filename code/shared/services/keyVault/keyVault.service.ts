import { ManagedIdentityCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { ServiceBase } from "../serviceBase";

/**
 * Gets the secret value from azure key vault
 *
 */
export class KeyVaultService extends ServiceBase {
    async getSecretValue(secretKey: string): Promise<string> {
        let secretValue = "";
        try {
            this.customLogger.info(`Begin KeyVaultService. Key: ${secretKey}`);
            const keyVaultUrl = process.env["KEY_VAULT_Url"];
            const credential = new ManagedIdentityCredential();
            const keyVaultClient = new SecretClient(keyVaultUrl, credential);
            // Get keyValutUrl for the given secret
            const secret = await keyVaultClient.getSecret(secretKey);
            secretValue = secret.value;
            this.customLogger.trace(`APPINFO:: fetching config from key vault. Key: ${secretKey}, Value: ${secretValue}`);
            return secretValue;
        } catch (error) {
            this.customLogger.error("KeyVaultService", error);
            throw error;
        }
    }
}
