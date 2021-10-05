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
import { GroupLOResponse } from "./model/groupLOsResponse";
import { GroupLOsRequest } from "./model/groupLOsRequest";
import { GroupService } from "../shared/service/groups/group";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CustomValidator } from "../shared/validators/customValidator";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/utils/customLogger.service";
import { ErrorService } from "../shared/service/errorHandling/error.service";
import { AppInsightsService } from "../shared/service/monitoring/applicationInsights";
import { Response } from "../shared/model/response";

/**
 * This api endpoint returns loan officer group ids
 * @param context - azure function context
 * @param req - http request
 */
export const groupLos: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "GroupLOs";
    await appInsightsService.setupProperties(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({
        msg: `HTTP trigger function for ${functionName} requested.`,
        request: req.query,
    });

    let groupLOResponse: GroupLOResponse;
    let response: Response;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: GroupLOsRequest = customValidator.convertToClass(GroupLOsRequest, req.query);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const groupsService = container.get<GroupService>(TYPES.CampaignGroupService);
        groupLOResponse = await groupsService.getGroupLOs(requestData);
        customLogger.info("Fetched GroupLOs successfully");
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = {
            headers: headers,
            body: status === 400 ? ErrorService.invalidRequest : response || groupLOResponse,
            status,
        };
    }
};
export const httpTrigger: AzureFunction = async function contextPropagatingHttpTrigger(context: Context, req: HttpRequest) {
    const correlationContext = appInsights.startOperation(context, req);
    return appInsights.wrapWithCorrelationContext(async () => {
        await groupLos(context, req);
        appInsights.defaultClient.flush();
    }, correlationContext)();
};
