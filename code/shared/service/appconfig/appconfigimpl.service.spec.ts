import { CustomLoggerImpl } from "../../utils/customLoggerImpl.service";
import { AppConfigServiceImpl } from "./appconfigimpl.service";
import { AppConfigurationClient } from "@azure/app-configuration";
import { AppConfigurationSettingResponseMockImpl } from "../../../testing/mock/AppConfigurationSettingResponseMockImpl.mode";

describe("getConfiguration method testing ", () => {
    jest.spyOn(CustomLoggerImpl.prototype, "error").mockImplementation(() => Promise.resolve());
    jest.spyOn(CustomLoggerImpl.prototype, "trace").mockImplementation(() => jest.fn());
    jest.spyOn(CustomLoggerImpl.prototype, "info").mockImplementation(() => jest.fn());
    test("getconfig  throws error", async () => {
        jest.spyOn(AppConfigurationClient.prototype, "getConfigurationSetting").mockImplementation(() =>
            Promise.reject(Error("not found"))
        );
        const appConfig = new AppConfigServiceImpl();
        const value = await appConfig.getConfiguration("testme");
        expect(value).toBeUndefined;
    });
    test("getconfig  return response from AppConfigurationClient", async () => {
        const response = new AppConfigurationSettingResponseMockImpl();
        response.key = "testme";
        response.label = "TEST";
        response.value = "pass_the_test";
        jest.spyOn(AppConfigurationClient.prototype, "getConfigurationSetting").mockImplementation(() =>
            Promise.resolve(response)
        );
        const appConfig = new AppConfigServiceImpl();
        const value = await appConfig.getConfiguration("testme");
        expect(value).toEqual("pass_the_test");
    });
    test(" getconfig from enviorment", async () => {
        // jest.spyOn(BaseErrorHandlerServiceImpl.prototype,"handleError").mockImplementation(() => Promise.resolve());
        //process.env = Object.assign(process.env,config.Values);
        process.env["ENVIRONMENT"] = "TEST";
        const appConfig = new AppConfigServiceImpl();
        const value = await appConfig.getConfiguration("ENVIRONMENT");
        expect(value).toBeDefined;
    });
});

describe("getGlobalConfiguration method testing ", () => {
    jest.spyOn(CustomLoggerImpl.prototype, "error").mockImplementation(() => Promise.resolve());
    jest.spyOn(CustomLoggerImpl.prototype, "trace").mockImplementation(() => jest.fn());
    jest.spyOn(CustomLoggerImpl.prototype, "info").mockImplementation(() => jest.fn());

    test("getconfig  throws error", async () => {
        jest.spyOn(AppConfigurationClient.prototype, "getConfigurationSetting").mockImplementation(() =>
            Promise.reject(Error("not found"))
        );
        const appConfig = new AppConfigServiceImpl();
        const value = await appConfig.getGlobalConfiguration("testme");
        expect(value).toBeUndefined;
    });
    test("getconfig  return response from AppConfigurationClient", async () => {
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
    test(" getconfig from enviorment", async () => {
        // jest.spyOn(BaseErrorHandlerServiceImpl.prototype,"handleError").mockImplementation(() => Promise.resolve());
        //process.env = Object.assign(process.env,config.Values);
        process.env["ENVIRONMENT"] = "TEST";
        const appConfig = new AppConfigServiceImpl();
        const value = await appConfig.getGlobalConfiguration("ENVIRONMENT");
        expect(value).toBeDefined;
    });
});
