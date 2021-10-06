import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { CustomValidator } from "../shared/validators/customValidator";
import { TYPES } from "../shared/inversify/types";
import { TimelineRequest } from "../Timeline/model/timelineRequest";
import { TimelineService } from "./service/Timeline.service";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "Timeline";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.query });

    let response: any;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: TimelineRequest = customValidator.convertToClass(TimelineRequest, req.query);
        const errors = await customValidator.validate(requestData);
        const isMinBeforeMaxDate = customValidator.isMinBeforeMaxDate(requestData.minDate, requestData.maxDate);
        if (!isMinBeforeMaxDate) {
            errors.push("Start time needs to be after end time");
        }
        const isDatesWeekApart = customValidator.isDatesWeekApart(requestData.minDate, requestData.maxDate);
        if (!isDatesWeekApart) {
            errors.push("Dates have to be within 7 days");
        }
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const timelineService = container.get<TimelineService>(TYPES.TimelineService);
        response = await timelineService.getTimelineService(requestData);
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

export default httpTrigger;
