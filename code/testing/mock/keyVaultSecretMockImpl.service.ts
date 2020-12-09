import { KeyVaultSecret, SecretProperties } from "@azure/keyvault-secrets";

export class KeyVaultSecretMockImpl implements KeyVaultSecret{
    properties: SecretProperties;
    value?: string;
    name: string;
    
}