import "reflect-metadata";
import container from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { injectable } from "inversify";
import { KeyVaultService } from "./keyvault.service";
import { ManagedIdentityCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { CustomLogger } from "../../utils/customLogger.service";
import { ErrorHandlerService } from "../exception/errorHandler.service";
@injectable()
export class KeyVaultServiceImpl implements KeyVaultService {
    private readonly logger = container.get<CustomLogger>(TYPES.CustomLogger);
    private readonly baseErrorHandler = container.get<ErrorHandlerService>(TYPES.BaseErrorHandler);

    public async getSecretValue(secretName: string): Promise<string> {
        this.logger.trace(`getSecretValue Method Initiated with secretName ${secretName}`);
        let secretValue: string = process.env[secretName];
        if (!secretValue) {
            try {
                const credential = new ManagedIdentityCredential();
                const url = process.env["KEY_VAULT_URL"];
                const client = new SecretClient(url, credential);
                const secretObj = await client.getSecret(secretName);
                this.logger.trace(`secretValue recieved from keyVault for secretKey :: ${secretName}`);
                secretValue = secretObj.value;
            } catch (error) {
                this.baseErrorHandler.handleError(
                    error,
                    "error in KeyVaultServiceImpl.getSecretValue while getting secret: "
                );
            }
        }
        return secretValue;
    }
}
