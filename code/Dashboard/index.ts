import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { GetDashboardService } from "./Service/GetDashboard.service";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { Response } from "../shared/model/response";
import { DashboardRequest } from "./Model/dashboardRequest";
import { CustomValidator } from "../shared/validators/customValidator";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "Dashboard";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.query });

    // This api doesnt match the others in response object but changing it means possibly breaking app
    let responseBody: any;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: DashboardRequest = customValidator.convertToClass(DashboardRequest, req.query);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const getDashboardService = container.get<GetDashboardService>(TYPES.GetDashBoardImpl);
        const response: Response = await getDashboardService.getDashBoardInfo(requestData);
        // doing this to keep the function response in the finally
        responseBody = response.data;
        customLogger.logData(responseBody);
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        responseBody = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = { headers: headers, body: status === 400 ? ErrorService.invalidRequest : responseBody, status };
    }
};

export default httpTrigger;
