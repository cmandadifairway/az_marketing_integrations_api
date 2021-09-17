import { AppConfigServiceImpl } from "./appconfigimpl.service";
import { AppConfigurationClient } from "@azure/app-configuration";
import { AppConfigurationSettingResponseMockImpl } from "../../../mock/AppConfigurationSettingResponseMockImpl.mode";
import { CustomLoggerMockImpl } from "../../../mock/customLoggerMockimpl.service";

describe("getSecondaryConfiguration method testing ", () => {
    test("getconfig  throws error", async () => {
        process.env["app-config-endpoint"] = "https://sample.azconfig.io/";
        jest.spyOn(AppConfigurationClient.prototype, "getConfigurationSetting").mockImplementation(() =>
            Promise.reject(Error("not found"))
        );
        const appConfig = new AppConfigServiceImpl();
        appConfig.logger = new CustomLoggerMockImpl();

        try {
            await appConfig.getSecondaryConfiguration("testme");
        } catch (e) {
            expect(e.message).toEqual("not found");
        }
    });

    test("getconfig  return response from AppConfigurationClient", async () => {
        process.env["app-config-endpoint"] = "https://sample.azconfig.io/";
        const response = new AppConfigurationSettingResponseMockImpl();
        response.key = "testme";
        response.label = "TEST";
        response.value = "pass_the_test";
        jest.spyOn(AppConfigurationClient.prototype, "getConfigurationSetting").mockImplementation(() =>
            Promise.resolve(response)
        );
        const appConfig = new AppConfigServiceImpl();
        const value = await appConfig.getSecondaryConfiguration("testme");
        expect(value).toEqual("pass_the_test");
    });

    test("getconfig from environment", async () => {
        process.env["ENVIRONMENT"] = "TEST";
        const appConfig = new AppConfigServiceImpl();
        const value = await appConfig.getSecondaryConfiguration("ENVIRONMENT");
        expect(value).toBeDefined;
    });
});

describe("getGlobalConfiguration method testing ", () => {
    test("getconfig  throws error", async () => {
        process.env["global-config-endpoint"] = "https://sample.azconfig.io/";
        jest.spyOn(AppConfigurationClient.prototype, "getConfigurationSetting").mockImplementation(() =>
            Promise.reject(Error("not found"))
        );
        const appConfig = new AppConfigServiceImpl();
        appConfig.logger = new CustomLoggerMockImpl();

        try {
            await appConfig.getGlobalConfiguration("testme");
        } catch (e) {
            expect(e.message).toEqual("not found");
        }
    });

    test("getconfig  return response from AppConfigurationClient", async () => {
        process.env["global-config-endpoint"] = "https://sample.azconfig.io/";
        const response = new AppConfigurationSettingResponseMockImpl();
        response.key = "testme";
        response.label = "TEST";
        response.value = "pass_the_test";
        jest.spyOn(AppConfigurationClient.prototype, "getConfigurationSetting").mockImplementation(() =>
            Promise.resolve(response)
        );
        const appConfig = new AppConfigServiceImpl();
        const value = await appConfig.getGlobalConfiguration("testme");
        expect(value).toEqual("pass_the_test");
    });

    test("getconfig from environment", async () => {
        process.env["ENVIRONMENT"] = "TEST";
        const appConfig = new AppConfigServiceImpl();
        const value = await appConfig.getGlobalConfiguration("ENVIRONMENT");
        expect(value).toBeDefined;
    });
});

describe("getConfiguration ", () => {
    test("getconfig returns empty string", async () => {
        const appConfig = new AppConfigServiceImpl();
        const value = appConfig.getConfiguration("testme");
        expect(value).toEqual("");
    });
});
