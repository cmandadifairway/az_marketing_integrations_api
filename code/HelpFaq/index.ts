import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { Response } from "../shared/model/response";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { CustomValidator } from "../shared/validators/customValidator";
import { TYPES } from "../shared/inversify/types";
import { HelpFaqRequest } from "./Model/helpFaqRequest";
import { HelpFaqResponse } from "./Model/helpFaqResponse";
import { HelpFaqService } from "../shared/services/helpFaq/helpFaqService";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "HelpFaq";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.query });

    let response: Response;
    let helpFaqResponse: HelpFaqResponse;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: HelpFaqRequest = customValidator.convertToClass(HelpFaqRequest, req.query);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const helpFaqService = container.get<HelpFaqService>(TYPES.HelpFaqService);
        helpFaqResponse = await helpFaqService.getFaqs(requestData);
        customLogger.logData(helpFaqResponse);
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = {
            headers: headers,
            body: status === 400 ? ErrorService.invalidRequest : response || helpFaqResponse,
            status,
        };
    }
};

export default httpTrigger;
