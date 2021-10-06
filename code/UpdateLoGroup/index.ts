import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { Response } from "../shared/model/response";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { CustomValidator } from "../shared/validators/customValidator";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { UpdateLoGroupRequest } from "./model/updateLoGroupRequest";
import { UpdateLoService } from "./services/updateLoGroup";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "UpdateLoGroup";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.body });

    let response: Response;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: UpdateLoGroupRequest = customValidator.convertToClass(UpdateLoGroupRequest, req.body);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const updateLoService = container.get<UpdateLoService>(TYPES.UpdateLoService);
        response = await updateLoService.updateLoGroup(requestData);
        customLogger.logData(response);
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = { headers: headers, body: status === 400 ? ErrorService.invalidRequest : response, status };
    }
};

export default httpTrigger;
