import { BigQuery } from "@google-cloud/bigquery";
import { ServiceBase } from "../serviceBase";
import { TYPES } from "../../inversify/types";
import { KeyVaultService } from "../keyVault/keyVault.service";

export interface BigQueryService {
    queryData: (sqlQuery: string, options: any) => Promise<any>;
}

let bigQueryClient: BigQuery;
export class BigQueryWrapper extends ServiceBase implements BigQueryService {
    private readonly keyVaultService = this.resolve<KeyVaultService>(TYPES.KeyVaultService);

    async queryData(sqlQuery: string, options: any): Promise<any> {
        try {
            if (!bigQueryClient) {
                bigQueryClient = await this.getClient();
            }
            return bigQueryClient.query(sqlQuery, options);
        } catch (error) {
            this.customLogger.error("Failed to get data from big query", error);
            throw error;
        }
    }

    private async getClient() {
        const projectId = "fairwayfirst-42aee";
        const credentials = await this.keyVaultService.getSecretValue("FF--BIGQUERY--KEY");
        bigQueryClient = new BigQuery({ credentials: JSON.parse(credentials), projectId: projectId });
        return bigQueryClient;
    }
}
