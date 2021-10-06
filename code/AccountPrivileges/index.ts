import { RelationshipService } from "../shared/services/relationship/relationshipService";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { Response } from "../shared/model/response";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";

/**
 * This api endpoint returns possible relationship privileges
 * @param context - azure function context
 * @param req - http request
 */
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "AccountPrivileges";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.query });

    let response: Response;
    let status = 200;
    try {
        const relationshipService = container.get<RelationshipService>(TYPES.RelationshipService);
        response = await relationshipService.getAccountPrivileges();
        customLogger.info(`Fetched ${functionName} successfully.`);
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
