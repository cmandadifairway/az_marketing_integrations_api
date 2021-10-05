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
import { GroupService } from "../shared/service/groups/group";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { ErrorService } from "../shared/service/errorHandling/error.service";
import { CustomLogger } from "../shared/utils/customLogger.service";
import { AppInsightsService } from "../shared/service/monitoring/applicationInsights";
import { Response } from "../shared/model/response";
import { TYPES } from "../shared/inversify/types";
import { CustomValidator } from "../shared/validators/customValidator";
import { GroupIdsRequest } from "./model/groupIdsRequest";

/**
 * This api endpoint returns loan officer group ids
 * @param context - azure function context
 * @param req - http request
 */
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "GroupIds";
    await appInsightsService.setupProperties(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({
        msg: `HTTP trigger function for ${functionName} requested.`,
        request: req.query,
    });

    let response: Response;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: GroupIdsRequest = customValidator.convertToClass(GroupIdsRequest, req.query);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const groupsService = container.get<GroupService>(TYPES.CampaignGroupService);
        response = await groupsService.getGroupIds(requestData);
        customLogger.info("Fetched GroupIds successfully");
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
