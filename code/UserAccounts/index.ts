import { RelationshipService } from "../shared/services/relationship/relationshipService";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { CustomValidator } from "../shared/validators/customValidator";
import { UserAccountsRequest } from "./Model/userAccountsRequest";
import { RelationshipResponse } from "../shared/model/relationship";

/**
 * This api endpoint returns accounts that have access to the loan officer in the request
 * @param context - azure function context
 * @param req - http request
 */
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "UserAccounts";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.query });

    let response: RelationshipResponse;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: UserAccountsRequest = customValidator.convertToClass(UserAccountsRequest, req.query);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const relationshipService = container.get<RelationshipService>(TYPES.RelationshipService);
        response = await relationshipService.getAccounts(requestData.loEmail);
        customLogger.info(`Fetched ${functionName} successfully for ${requestData.loEmail}.`);
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
