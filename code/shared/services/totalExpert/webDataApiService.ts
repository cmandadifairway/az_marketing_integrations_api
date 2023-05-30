import { ServiceBase } from "../serviceBase";
import axios from "axios";
import { container } from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { IAppSettings } from "../../model/appSettings";
import { ConfigHelper } from "../../utils/config.helper";

export class WebDataApiService extends ServiceBase {
    private configHelper = container.get<ConfigHelper>(TYPES.ConfigHelper);
    private appSettings: IAppSettings;

    constructor() {
        super();
        this.appSettings = this.configHelper.appSettings;
    }

    async getMarketingWebData(): Promise<any> {
        let resp;
        try {
            this.customLogger.info("Begin getMarketingWebData");
            resp = await axios.get(this.appSettings.WebData_Url);
            this.customLogger.info("End getMarketingWebData");
        } catch (error) {
            this.customLogger.error("Error while trying to get marketing webdata from aws", error);
            throw error;
        }
        return resp?.data;
    }
}
