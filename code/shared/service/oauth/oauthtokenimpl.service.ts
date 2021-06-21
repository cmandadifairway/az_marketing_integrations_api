import { ManagedIdentityCredential, DefaultAzureCredential } from "@azure/identity";
import { injectable } from "inversify";
import container from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { CustomLogger } from "../../utils/customLogger.service";
import { AppConfigService } from "../appconfig/appconfig.service";
import { ErrorHandlerService } from "../exception/errorHandler.service";
import { OAuthTokenService } from "./oauthtoken.service";

/*
* This class will help to get the OAUth Token for give scopes.
* For local development reach out to cloudinfra@fairwaymc.com to get the values for apimScope,managedIdentityClientId & tenantId.
* For cloud environment cloudinfra Team will add apimScope to app ,managedIdentityClientId to appconfig and give ManagedIdentity access to APIM
*/
@injectable()
export class OAuthTokenSeviceImpl implements OAuthTokenService {
	private readonly logger = container.get<CustomLogger>(TYPES.CustomLogger);
	private readonly baseErrorHandler = container.get<ErrorHandlerService>(TYPES.BaseErrorHandler);
	private readonly appConfigService: AppConfigService = container.get<AppConfigService>(TYPES.AppConfigService);

	async getAPIMToken(apimScope: string, managedIdentityClientId: string, tenantId: string): Promise<string> {
		return this.getToken(apimScope, managedIdentityClientId, tenantId);
	}
	async getCoreServiceEncompassAPIMToken(): Promise<string> {
		this.logger.info(`getCoreServiceEncompassAPIMToken Method Initiated `);
		let apimScope: string = await this.appConfigService.getGlobalConfiguration("APIM:ENCOMPASS:SCOPE");
		let apimBackEnd: string = await this.appConfigService.getGlobalConfiguration("APIM:ENCOMPASS:BACKEND");
		return this.getToken(apimScope, apimBackEnd, null);

	}

	private async getToken(apimScope: string, managedIdentityClientId: string, tenantId: string): Promise<string> {
		let apimToken;
		let credential;
		this.logger.info(`getToken Method Initiated `);
		try {
			if (process.env["environment"] === "local") {
				// tenantId required only for local development. For Azure environment ManagedIdentity will be used to authenticate.
				if (!tenantId) {
					tenantId = await this.appConfigService.getConfiguration("AZURE_TENANT_ID");
				}
				credential = new DefaultAzureCredential({
					tenantId: tenantId
				});
			} else {
				credential = new ManagedIdentityCredential(managedIdentityClientId);
			}
			const authResponse = await credential.getToken(apimScope);
			apimToken = authResponse.token;
			this.logger.info(`getToken Method completed`);
		} catch (error) {
			this.baseErrorHandler.handleError(error, `error in OAuthTokenSeviceImpl.getToken:: ${error.message}`);
			throw error;
		}
		return apimToken;
	}

}