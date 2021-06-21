import { ManagedIdentityCredential, DefaultAzureCredential } from "@azure/identity";
import { injectable } from "inversify";
import container from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { ApplicationError } from "../../model/appError.model";
import { CustomLogger } from "../../utils/customLogger.service";
import { AppConfigService } from "../appconfig/appconfig.service";
import { ErrorHandlerService } from "../exception/errorHandler.service";
import { OAuthTokenService } from "./oauthtoken.service";

/*
* This class will help to get the OAUth Token for given scopes.
* For local development reach out to cloudinfra@fairwaymc.com to get the values for apimScope,managedIdentityClientId & tenantId.
* tenantId can also be found from Dev subscription by running command az login
* For cloud environment cloudinfra Team will add apimScope ,managedIdentityClientId to appconfig and give ManagedIdentity access to APIM
*/
@injectable()
export class OAuthTokenSeviceImpl implements OAuthTokenService {
	private readonly logger = container.get<CustomLogger>(TYPES.CustomLogger);
	private readonly baseErrorHandler = container.get<ErrorHandlerService>(TYPES.BaseErrorHandler);
	private readonly appConfigService: AppConfigService = container.get<AppConfigService>(TYPES.AppConfigService);

	async getAPIMToken(apimScope: string, managedIdentityClientId: string, tenantId: string): Promise<string> {
		let apimToken;
		let credential;
		this.logger.info(`getAPIMToken Method Initiated `);
		try {
			if (process.env["environment"] === "local") {
				// tenantId required only for local development. For Azure environment ManagedIdentity will be used to authenticate.
				let tenentId: string = await this.appConfigService.getConfiguration("AZURE_TENANT_ID");
				credential = new DefaultAzureCredential({
					tenantId: tenentId
				});
			} else {
				credential = new ManagedIdentityCredential(managedIdentityClientId);
			}
			const authResponse = await credential.getToken(apimScope);
			apimToken = authResponse.token;
			this.logger.info(`getAPIMToken Method completed`);
		} catch (error) {
			this.baseErrorHandler.handleError(error, `error in OAuthTokenSeviceImpl.getAPIMToken:: ${error.message}`);
			throw new ApplicationError(error,"OAUTH_ERROR",500,`error while getting APIMToken:: ${error.message}`);
		}
		return apimToken;
	}
	async getCoreServiceEncompassAPIMToken(): Promise<string> {
		this.logger.info(`getCoreServiceEncompassAPIMToken Method Initiated `);
		let apimToken;
		let apimScope: string = await this.appConfigService.getGlobalConfiguration("APIM:ENCOMPASS:SCOPE");
		let apimBackEnd: string = await this.appConfigService.getGlobalConfiguration("APIM:ENCOMPASS:BACKEND");
		let credential;
		try {
			if (process.env["environment"] === "local") {
				// tenantId required only for local development. For Azure environment ManagedIdentity will be used to authenticate.
				let tenentId: string = await this.appConfigService.getConfiguration("AZURE_TENANT_ID");
				credential = new DefaultAzureCredential({
					tenantId: tenentId
				});
			} else {
				credential = new ManagedIdentityCredential(apimBackEnd);
			}
			const authResponse = await credential.getToken(apimScope);
			apimToken = authResponse.token;
			this.logger.info(`getEncompassAPIMToken Method completed`);
		} catch (error) {
			this.baseErrorHandler.handleError(error, `error in OAuthTokenSeviceImpl.getCoreServiceEncompassAPIMToken :: ${error.message}`);
			throw new ApplicationError(error,"OAUTH_ERROR",500,`error while getting coreServiceEncompassAPIMToken:: ${error.message}`);
		}
		return apimToken;
	}

}