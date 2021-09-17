import { KeyVaultServiceImpl } from "./keyvaultImpl.service";
import { CustomLoggerImpl } from "../../utils/customLoggerImpl.service";
import { SecretClient } from "@azure/keyvault-secrets";
import { KeyVaultSecretMockImpl } from "../../../mock/keyVaultSecretMockImpl.service";
import { container } from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { CustomLogger } from "../../utils/customLogger.service";
import { CustomLoggerMockImpl } from "../../../mock/customLoggerMockimpl.service";

describe("KeyVaultService testing", () => {
    test("getSecretValue  throws error", async () => {
        jest.spyOn(SecretClient.prototype, "getSecret").mockImplementation(() =>
            Promise.reject(new Error("not found"))
        );

        let KeyVaultService = new KeyVaultServiceImpl();
        KeyVaultService.logger = new CustomLoggerMockImpl();
        try {
            await KeyVaultService.getSecretValue("test-keyvault");
        } catch (e) {
            expect(e.message).toEqual("not found");
        }
    });

    test("getSecretValue from keyVault", async () => {
        const secret = new KeyVaultSecretMockImpl();
        secret.value = "test-keyvault";
        jest.spyOn(SecretClient.prototype, "getSecret").mockImplementation(() => Promise.resolve(secret));

        const KeyVaultService = new KeyVaultServiceImpl();
        const secretValue = await KeyVaultService.getSecretValue("test-keyvault");

        expect(secretValue).toEqual("test-keyvault");
    });

    test("getSecretValue to fetch from environment", async () => {
        process.env["test-keyvault"] = "test-keyvault";
        container.unbind(TYPES.CustomLogger);
        container.bind<CustomLogger>(TYPES.CustomLogger).to(CustomLoggerMockImpl);

        const KeyVaultService = new KeyVaultServiceImpl();
        const secretValue = await KeyVaultService.getSecretValue("test-keyvault");

        expect(secretValue).toEqual("test-keyvault");
    });
});
