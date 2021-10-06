import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { Response } from "../shared/model/response";
import { CustomValidator } from "../shared/validators/customValidator";
import { ExportLeadsService } from "./Service/ExportLeads.service";
import { ExportLeadsRequest } from "./Model/ExportLeadsRequest";
import { ExportLeadsResponse } from "./Model/ExportLeadsResponse";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "ExportLeads";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    const requestData = req.query;
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: requestData });

    let response: Response;
    let exportLeadsResponse: ExportLeadsResponse = { data: "Request received successfully", Error: false };
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const errors = await customValidator.convertAndValidate(ExportLeadsRequest, requestData);

        const isValidUser = await customValidator.isValidUser(requestData["loEmail"]);
        if (!isValidUser) {
            errors.push("The provided email address is not a valid user");
        }

        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request body: ${errors.join(";")}`);
        }

        const exportLeadsService = container.get<ExportLeadsService>(TYPES.ExportLeadsServiceImpl);
        exportLeadsService
            .exportLeads(requestData["loEmail"])
            .then((o) => {})
            .catch((o) => {});
        customLogger.logData(exportLeadsResponse);
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = {
            headers: headers,
            body: status === 400 ? ErrorService.invalidRequest : response || exportLeadsResponse,
            status,
        };
    }
};

export default httpTrigger;
