import { KeyVaultSecret, SecretProperties } from "@azure/keyvault-secrets";
import { ServiceBase } from "../shared/service/__mocks__/serviceBase";

export class KeyVaultSecretMockImpl extends ServiceBase implements KeyVaultSecret {
    properties: SecretProperties;
    value?: string;
    name: string;
}
