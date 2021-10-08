import { GroupService } from "../shared/services/groups/group";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { Response } from "../shared/model/response";
import { TYPES } from "../shared/inversify/types";

/**
 * This api endpoint returns loan officer group ids
 * @param context - azure function context
 * @param req - http request
 */
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "GroupIds";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.query });

    let response: Response;
    let status = 200;
    try {
        const groupsService = container.get<GroupService>(TYPES.CampaignGroupService);
        response = await groupsService.getGroupIds();
        customLogger.info("Fetched GroupIds successfully");
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = { headers: headers, body: status === 400 ? ErrorService.invalidRequest : response, status };
    }
};

export default httpTrigger;
