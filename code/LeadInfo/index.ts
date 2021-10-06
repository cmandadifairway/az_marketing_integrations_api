import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { GetLeadService } from "./service/GetLead.service";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { CustomValidator } from "../shared/validators/customValidator";
import { LeadInfoRequest } from "./Model/leadInfoRequest";
import { LeadInfoResponse } from "./Model/leadInfoResponse";
import { Response } from "../shared/model/response";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "LeadInfo";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.body });

    let leadInfo: LeadInfoResponse;
    let status = 200;
    let response: Response;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: LeadInfoRequest = customValidator.convertToClass(LeadInfoRequest, req.body);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request body: ${errors.join(";")}`);
        }

        const getLeadService = container.get<GetLeadService>(TYPES.GetLeadServiceImpl);
        leadInfo = await getLeadService.getLeadInfo(requestData);
        customLogger.logData(leadInfo);
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = {
            headers: headers,
            body: status === 400 ? ErrorService.invalidRequest : response || leadInfo,
            status,
        };
    }
};

export default httpTrigger;
