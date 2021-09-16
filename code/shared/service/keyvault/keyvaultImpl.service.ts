import { KeyVaultService } from "./keyvault.service";
import { ManagedIdentityCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { ServiceBase } from "../serviceBase";

// Ensure the client is instantiated once
let kvClient: SecretClient;
export class KeyVaultServiceImpl extends ServiceBase implements KeyVaultService {
    async getSecretValue(secretKey: string): Promise<string> {
        let secretValue: string = process.env[secretKey];

        if (!secretValue) {
            try {
                let keyVaultClient: SecretClient;
                if (!kvClient) {
                    keyVaultClient = this.getKeyVaultClient();
                } else {
                    keyVaultClient = kvClient;
                }
                const secret = await keyVaultClient.getSecret(secretKey);

                secretValue = secret.value;
            } catch (error) {
                this.customLogger.error("Failed to get secret from key vault", error);
                throw error;
            }
        }
        return secretValue;
    }

    private getKeyVaultClient() {
        const credential = new ManagedIdentityCredential();
        kvClient = new SecretClient(process.env["KEY_VAULT_URL"], credential);
        return kvClient;
    }
}
