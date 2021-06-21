export interface OAuthTokenService {

	getCoreServiceEncompassAPIMToken(): Promise<string>;
	getAPIMToken(apimScope:string,managedIdentityClientId :string,tenantId:string): Promise<string>;
}