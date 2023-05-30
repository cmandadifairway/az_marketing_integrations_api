import { UtilityService } from "../../utils/utility.service";
import { ConfigHelper } from "../../utils/config.helper";
import { container } from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { IAppSettings } from "../../model/appSettings";
import { DataLakeServiceClient, StorageSharedKeyCredential, DataLakeFileSystemClient, DataLakeFileClient } from "@azure/storage-file-datalake";
import { ServiceBase } from "../serviceBase";

/**
 * Helper service for reading/writing data to Data Lake blob storage
 */
export class DataLakeService extends ServiceBase {
    private utilityService = container.get<UtilityService>(TYPES.UtilityService);
    private configHelper = container.get<ConfigHelper>(TYPES.ConfigHelper);
    private appSettings: IAppSettings;

    constructor() {
        super();
        this.appSettings = this.configHelper.appSettings;
    }

    async uploadDeltasToDataLake(data: any, integrationType: IntegrationType): Promise<boolean> {
        let folderPath: string;
        let fileName: string;
        try {
            folderPath = this.appSettings[`Datalake_${integrationType}_Folder`];
            fileName = `${integrationType.toLocaleLowerCase()}_deltas.json`;
            await this.uploadFileToDataLake(data, folderPath, fileName);
            await this.utilityService.saveFileLocally(data, fileName, integrationType);
        } catch (error) {
            this.customLogger.info(`Error uploadFileToDataLake: ${folderPath}/${fileName}`);
            this.customLogger.error("uploadFileToDataLake", error);
            throw error;
        }
        return true;
    }

    /**
     * Saves the file into data lake.
     * @param data -  data to save
     * @param folderPath  - Folder path in data lake storage
     * @param fileName - File Name to save
     */
    async uploadFileToDataLake(data: any, folderPath: string, fileName: string): Promise<boolean> {
        try {
            // establish datalake connection
            this.customLogger.info(`Begin uploadFileToDataLake: ${folderPath}/${fileName}`);

            const datalakeServiceClient = await this.getDataLakeServiceClient();
            const fileSystemClient = await this.getFileSystemClient(datalakeServiceClient, folderPath);

            // convert json to stream
            const content = fileName.endsWith(".json") ? JSON.stringify(data) : data;
            const streamContents = Buffer.from(content);

            // create stream as file in data lake
            const fileClient = fileSystemClient.getFileClient(fileName);
            await fileClient.create();
            await fileClient.append(streamContents, 0, streamContents?.length);
            await fileClient.flush(streamContents?.length);

            this.customLogger.info(`End   uploadFileToDataLake: ${folderPath}/${fileName}`);
            return true;
        } catch (error) {
            this.customLogger.info(`Error uploadFileToDataLake: ${folderPath}/${fileName}`);
            this.customLogger.error("uploadFileToDataLake", error);
            throw error;
        }
    }

    /**
     * Deletes the file from Data Lake
     * @param folderPath - folder path
     * @param fileName  -  file name to delete
     */
    async deleteFile(folderPath: string, fileName: string): Promise<boolean> {
        try {
            // establish datalake connection
            this.customLogger.info(`Begin deleteFile: ${folderPath}/${fileName}`);

            const datalakeServiceClient = await this.getDataLakeServiceClient();
            const fileSystemClient = await this.getFileSystemClient(datalakeServiceClient, folderPath);

            // create stream as file in data lake
            const fileClient = fileSystemClient.getFileClient(fileName);
            await fileClient.deleteIfExists();
            this.customLogger.info(`End   deleteFile: ${folderPath}/${fileName}`);
            return true;
        } catch (error) {
            this.customLogger.info(`Error deleteFile: ${folderPath}/${fileName}`);
            this.customLogger.error("deleteFile", error);
            throw error;
        }
    }

    /**
     * Gets DataLakeServiceClient for the given account
     * @param accountName
     * @param accountKey
     */
    async getDataLakeServiceClient(): Promise<DataLakeServiceClient> {
        const accountKey = this.appSettings.DataLake_AccountKey;
        const accountName = this.appSettings.Datalake_Account_Name;
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
        const datalakeServiceClient = new DataLakeServiceClient(`https://${accountName}.dfs.core.windows.net`, sharedKeyCredential);
        return datalakeServiceClient;
    }

    /**
     * Gets FileSystemClient for the given DataLakeServiceClient
     * @param accountName
     * @param accountKey
     */
    async getFileSystemClient(datalakeServiceClient, folderPath): Promise<DataLakeFileSystemClient> {
        const fileSystemClient = datalakeServiceClient.getFileSystemClient(folderPath);
        return fileSystemClient;
    }

    /**
     * Returns json object
     * Gets workday json file from data lake
     */
    async getData(integrationType: IntegrationType): Promise<any> {
        const data = { source: [], target: [] };
        const asynCalls = [];
        let folderPath, fileName;
        try {
            this.customLogger.info("Begin getData");

            folderPath = this.appSettings[`Datalake_${integrationType}_Folder`];
            fileName = `${integrationType.toLocaleLowerCase()}_api_users.json`;

            const env = process.env["environment"] || "local";
            if (env === "local") {
                data.source = await this.utilityService.readFile(
                    "C:\\Users\\chandra.mandadi\\Downloads\\ADFIntegrations\\FlowApi\\flow_api_users.json"
                );
                if (integrationType !== IntegrationType.TotalExpert) {
                    data.target = await this.utilityService.readFile(
                        `C:\\Users\\chandra.mandadi\\Downloads\\ADFIntegrations\\${integrationType}\\${fileName}`
                    );
                }
            } else {
                asynCalls.push(this.getFile(this.appSettings.Datalake_Flowapi_Folder, "flow_api_users.json", false));
                if (integrationType !== IntegrationType.TotalExpert) {
                    asynCalls.push(this.getFile(folderPath, fileName, false));
                }
                const result = await Promise.all(asynCalls);
                data.source = result[0];
                if (result.length > 1) {
                    data.target = result[1];
                }
            }
            if (data.source) {
                // we only process inactive users from certain days ago.
                const todaysDate = new Date();
                let inactive_Users_Days_Ago = this.utilityService.convertToNumber(this.appSettings.Inactive_Users_Days_Ago);
                inactive_Users_Days_Ago = inactive_Users_Days_Ago == 0 ? 30 : inactive_Users_Days_Ago;
                const daysAgo = this.utilityService.getDate(inactive_Users_Days_Ago);
                let inActiveUsers = data.source.filter((o) => o.workday_data.active_status === "0" && o.workday_data.upn.indexOf("@") > 0);

                inActiveUsers = inActiveUsers.filter((o) => {
                    let date = new Date(o.workday_data.termination_date);
                    return date >= daysAgo && date <= todaysDate;
                });

                let activeUsers = data.source.filter((o) => o.workday_data.active_status === "1" && o.workday_data.upn.indexOf("@") > 0);
                let allUsers = activeUsers.concat(inActiveUsers);
                data.source = allUsers;
            }
            this.customLogger.info("End getData");
        } catch (error) {
            this.customLogger.error("Error in getData", error);
        }
        return data;
    }

    /**
     * Gets file from data lake.
     * @param folderPath
     * @param fileName
     * @param getTodaysFileOnly - when true, checks date modified on the file and returns only if today's file
     */
    async getFile(folderPath: string, fileName: string, getTodaysFileOnly?: boolean): Promise<any> {
        try {
            this.customLogger.info(`Begin getFile: ${folderPath}/${fileName}`);

            const datalakeServiceClient = await this.getDataLakeServiceClient();
            const fileSystemClient: DataLakeFileSystemClient = await this.getFileSystemClient(datalakeServiceClient, folderPath);
            const fileClient: DataLakeFileClient = fileSystemClient.getFileClient(fileName);
            const blobDownloadResponse = await fileClient.read();

            // if (this.utility.convertNullToBoolean(getTodaysFileOnly)) {
            // 	const fileModifiedDate = blobDownloadResponse?.lastModified;
            // 	if (!this.utility.isToday(fileModifiedDate)) {
            // 		return "";
            // 	}
            // }
            const downloadedString = await this.utilityService.streamToString(blobDownloadResponse?.readableStreamBody);
            let data;
            if (fileName.endsWith(".json")) {
                data = JSON.parse(downloadedString, this.replaceUndefined);
            } else {
                data = downloadedString;
            }
            this.customLogger.info(`End getFile: ${folderPath}/${fileName}`);
            return data;
        } catch (error) {
            this.customLogger.info(`Error getFile: ${folderPath}/${fileName}`);
        }
        return "";
    }

    /**
     * Transform method for parsing json. Replaces nulls with empty string
     * @param key
     * @param value
     */
    replaceUndefined = (key, value) => (value !== undefined ? value : "");
}

export enum IntegrationType {
    MailChimp = "MailChimp",
    TotalExpert = "TotalExpert",
    Workfront = "Workfront",
}
