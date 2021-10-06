import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AppInsightsService } from "../shared/service/monitoring/applicationInsights";
import { ErrorService } from "../shared/service/errorHandling/error.service";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/utils/customLogger.service";
import { Response } from "../shared/model/response";
import { CustomValidator } from "../shared/validators/customValidator";
import { BannerService } from "../shared/service/banner/bannerService";
import { CreateBannerRequest } from "./model/createBannerRequest";

const createBanner: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "CreateBanner";
    await appInsightsService.startService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({
        msg: `HTTP trigger function for ${functionName} requested.`,
        request: req.body,
    });

    let response: Response;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: CreateBannerRequest = customValidator.convertToClass(CreateBannerRequest, req.body);
        const errors = await customValidator.validate(requestData);
        const isFutureDate = customValidator.isFutureDate(requestData.expirationDate);
        if (!isFutureDate) {
            errors.push("expirationDate must be a future date");
        }

        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const bannerService = container.get<BannerService>(TYPES.BannerService);
        response = await bannerService.createBanner(requestData);
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

export default createBanner;
