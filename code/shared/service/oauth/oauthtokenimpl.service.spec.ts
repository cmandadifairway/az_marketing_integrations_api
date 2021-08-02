import { DefaultAzureCredential } from "@azure/identity";
import container from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { BaseError } from "../../model/baseError.model";
import { CustomLoggerImpl } from "../../utils/customLoggerImpl.service";
import { AppConfigService } from "../appconfig/appconfig.service";
import { OAuthTokenSeviceImpl } from "./oauthtokenimpl.service";

describe("test getting oauth token for APIM gateway", () => {
    beforeEach(() => {
        jest.spyOn(CustomLoggerImpl.prototype, "error").mockImplementation(() => Promise.resolve());
        jest.spyOn(CustomLoggerImpl.prototype, "critical").mockImplementation(() => Promise.resolve());
        jest.spyOn(CustomLoggerImpl.prototype, "trace").mockImplementation(() => jest.fn());
        jest.spyOn(CustomLoggerImpl.prototype, "info").mockImplementation(() => jest.fn());
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test(" getAPIMToken  throws error ", async () => {
        const oAuthService = new OAuthTokenSeviceImpl();
        try {
            await oAuthService.getAPIMToken("testScope", "testIdentityId", null);
        } catch (error) {
            expect(error).toBeInstanceOf(BaseError);
            expect(error.name).toBe("OAUTH_ERROR");
        }
    });

    test(" getAPIMToken success flow for local with DefaultAzureCredential ", async () => {
        process.env["environment"] = "local";
        const authResponse = {
            token: "12344",
        };
        jest.spyOn(container.get<AppConfigService>(TYPES.AppConfigService), "getConfiguration").mockImplementation(() =>
            Promise.resolve("123")
        );
        //@ts-ignore
        //prettier-ignore
        jest.spyOn(DefaultAzureCredential.prototype, "getToken").mockImplementation(() => Promise.resolve(authResponse));
        const oAuthService = new OAuthTokenSeviceImpl();
        const token = await oAuthService.getAPIMToken("testScope", "testIdentityId", "123");
        expect(token).toEqual("12344");
    });

    test(" getCoreServiceEncompassAPIMToken  throws error ", async () => {
        const oAuthService = new OAuthTokenSeviceImpl();
        try {
            await oAuthService.getCoreServiceEncompassAPIMToken();
        } catch (error) {
            expect(error).toBeInstanceOf(BaseError);
            expect(error.name).toBe("OAUTH_ERROR");
        }
    });

    test(" getCoreServiceEncompassAPIMToken success flow for local ", async () => {
        process.env["environment"] = "local";
        const authResponse = {
            token: "12344",
        };
        jest.spyOn(container.get<AppConfigService>(TYPES.AppConfigService), "getConfiguration").mockImplementation(() =>
            Promise.resolve("123")
        );
        //@ts-ignore
        //prettier-ignore
        jest.spyOn(DefaultAzureCredential.prototype, "getToken").mockImplementation(() => Promise.resolve(authResponse));
        const oAuthService = new OAuthTokenSeviceImpl();
        const token = await oAuthService.getCoreServiceEncompassAPIMToken();
        expect(token).toEqual("12344");
    });
});
