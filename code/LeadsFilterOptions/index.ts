import { LeadsFilterOptionsService } from "./Service/LeadsFilterOptions.service";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { Response } from "../shared/model/response";
import { LeadsResponse } from "../shared/model/leadsResponse";
import { CustomValidator } from "../shared/validators/customValidator";
import { LeadsFilterOptionsRequest } from "./classes/leadsFilterOptionsRequest";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "LeadsFilterOptions";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.query });
    let response: Response;
    let leadsResponse: LeadsResponse;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: LeadsFilterOptionsRequest = await customValidator.convertToClass(
            LeadsFilterOptionsRequest,
            req.query
        );
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request body: ${errors.join(";")}`);
        }
        const leadsFilterOptionsService = container.get<LeadsFilterOptionsService>(TYPES.LeadsFilterOptionsServiceImpl);
        response = await leadsFilterOptionsService.getAllFilterOptions(requestData);
        customLogger.logData(leadsResponse);
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = {
            headers: headers,
            body: status === 400 ? ErrorService.invalidRequest : response || leadsResponse,
            status,
        };
    }
};

export default httpTrigger;
