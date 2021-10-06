import { AnalyticsRequest } from "./Classes/analyticsRequest";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { TYPES } from "../shared/inversify/types";
import { AnalyticsService } from "./Service/Analytics.service";
import { Response } from "../shared/model/response";
import { CustomValidator } from "../shared/validators/customValidator";
import { AnalyticsResponse } from "./Classes/analyticsResponse";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "Analytics";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.query });

    let response: Response;
    let analyticsResponse: AnalyticsResponse;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: AnalyticsRequest = customValidator.convertToClass(AnalyticsRequest, req.query);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const analyticsService = container.get<AnalyticsService>(TYPES.AnalyticsServiceImpl);
        analyticsResponse = await analyticsService.getAnalytics(requestData);
        customLogger.logData(analyticsResponse);
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = {
            headers: headers,
            body: status === 400 ? ErrorService.invalidRequest : response || analyticsResponse,
            status,
        };
    }
};

export default httpTrigger;
