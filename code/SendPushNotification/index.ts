import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { CustomValidator } from "../shared/validators/customValidator";
import { SendPushRequest } from "./Model/sendPushRequest";
import { Response } from "../shared/model/response";
import { ServiceBusUtility } from "../shared/services/servicebus/serviceBus.service";

const sendPushNotificationHttpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "SendPushNotification";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    const data = req.body;
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: data });

    let response: Response;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: SendPushRequest = customValidator.convertToClass(SendPushRequest, req.body);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const serviceBusService = container.get<ServiceBusUtility>(TYPES.ServiceBusService);
        const result = await serviceBusService.serviceBusCall(
            requestData,
            "FF-SB-WEBHOOK-CONSTRING",
            "FF-SB-NOTIFICATIONS-TOPIC",
            {
                Count: 1,
            }
        );
        response = { data: result ? "Success" : "Failed", Error: !result };
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

export default sendPushNotificationHttpTrigger;
