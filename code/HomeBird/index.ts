import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { SendToHomeBirdService } from "./service/SendToHomeBird.service";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { Response } from "../shared/model/response";
import { CustomValidator } from "../shared/validators/customValidator";
import { HomeBirdRequest } from "./model/homeBirdRequest";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "Homebird";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.body });

    let response: Response;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: HomeBirdRequest = await customValidator.convertToClass(HomeBirdRequest, req.body);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request body: ${errors.join(";")}`);
        }

        const sendToHomeBirdService = container.get<SendToHomeBirdService>(TYPES.SendToHomeBirdImpl);
        response = await sendToHomeBirdService.sendToHomeBirdService(requestData);
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
