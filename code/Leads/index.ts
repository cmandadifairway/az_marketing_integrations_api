import { LeadsResponse } from "../shared/model/leadsResponse";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { LeadsService } from "./Service/Leads.service";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { Response } from "../shared/model/response";
import { CustomValidator } from "../shared/validators/customValidator";
import { LeadsRequest } from "./classes/leadsRequest";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "Leads";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.body });

    let response: Response;
    let leadsResponse: LeadsResponse;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: LeadsRequest = await customValidator.convertToClass(LeadsRequest, req.body);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request body: ${errors.join(";")}`);
        }

        const leadsService = container.get<LeadsService>(TYPES.LeadsServiceImpl);
        leadsResponse = await leadsService.getAllLeadsForDisplay(requestData);
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
