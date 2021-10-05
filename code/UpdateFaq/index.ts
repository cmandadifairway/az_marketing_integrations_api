import * as appInsights from "applicationinsights";
const env = process.env.environment;
if (env !== "unittest" && env !== "local") {
    appInsights
        .setup() // assuming ikey is in env var
        .setAutoDependencyCorrelation(true, true)
        .setAutoCollectDependencies(true)
        .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
        .start();
}
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AppInsightsService } from "../shared/service/monitoring/applicationInsights";
import { ErrorService } from "../shared/service/errorHandling/error.service";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/utils/customLogger.service";
import { Response } from "../shared/model/response";
import { UpdateFaqRequest } from "./model/updateFaqRequest";
import { CustomValidator } from "../shared/validators/customValidator";
import { HelpFaqService } from "../shared/service/helpFaq/helpFaqService";

export const updateFaq: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "UpdateFaq";
    await appInsightsService.setupProperties(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({
        msg: `HTTP trigger function for ${functionName} requested.`,
        request: req.body,
    });

    let response: Response;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: UpdateFaqRequest = customValidator.convertToClass(UpdateFaqRequest, req.body);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const updateFaqService = container.get<HelpFaqService>(TYPES.HelpFaqService);
        response = await updateFaqService.updateFaq(requestData);
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
export const httpTrigger: AzureFunction = async function contextPropagatingHttpTrigger(context: Context, req: HttpRequest) {
    const correlationContext = appInsights.startOperation(context, req);
    return appInsights.wrapWithCorrelationContext(async () => {
        await updateFaq(context, req);
        appInsights.defaultClient.flush();
    }, correlationContext)();
};
