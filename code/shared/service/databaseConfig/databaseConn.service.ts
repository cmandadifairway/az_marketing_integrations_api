import { MongoClient, Db } from "mongodb";
import { KeyVaultService } from "../keyvault/keyvault.service";
import { TYPES } from "../../inversify/types";
import { ServiceBase } from "../serviceBase";

// Ensure the client is instantiated once
let db: Db;
let client: MongoClient;

export class DbConnectionService extends ServiceBase {
    private keyVaultService = this.resolve<KeyVaultService>(TYPES.KeyVaultService);

    public async getDbConfiguration(): Promise<Db> {
        if (db) {
            return db;
        } else {
            const dbName = await this.keyVaultService.getSecretValue("FF--COSMOS--NAME");
            client = await this.createDBConnection();
            db = client.db(dbName);
            return db;
        }
    }

    private async createDBConnection(): Promise<MongoClient> {
        try {
            const url = await this.keyVaultService.getSecretValue("FF--COSMOS--URL");
            return await MongoClient.connect(url);
        } catch (error) {
            this.logger.error("Error while creating a db connection", error);
            throw error;
        }
    }
}
