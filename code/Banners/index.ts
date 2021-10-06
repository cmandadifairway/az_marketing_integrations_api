import { BannerService } from "./../shared/services/banner/bannerService";
import { BannerRequest } from "./Model/bannerRequest";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { CustomValidator } from "../shared/validators/customValidator";
import { TYPES } from "../shared/inversify/types";
import { BannerResponse } from "./Model/bannerResponse";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "Banners";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.query });

    let response: BannerResponse;
    //let bannerResponse: BannerResponse;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: BannerRequest = customValidator.convertToClass(BannerRequest, req.query);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const bannerService = container.get<BannerService>(TYPES.BannerService);
        response = await bannerService.getBanners(requestData);
        customLogger.logData(response);
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = {
            headers: headers,
            body: status === 400 ? ErrorService.invalidRequest : response,
            status,
        };
    }
};

export default httpTrigger;
