import { TotalExpertService } from "./../shared/services/totalExpert/totalExpertService";
import { WorkfrontService } from "./../shared/services/workFront/workfrontService";
import { MailChimpService } from "../shared/services/mailChimp/mailChimpService";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { Response } from "../shared/model/response";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { TYPES } from "../shared/inversify/types";
import { ConfigHelper } from "../shared/utils/config.helper";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "GetDeltas";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    const configHelper = container.get<ConfigHelper>(TYPES.ConfigHelper);
    customLogger.logData({ msg: `HTTP trigger ${functionName} requested.`, request: req.query });

    let response: Response;
    let status = 200;
    let project = "";
    let projects = ["mailchimp", "workfront", "totalexpert"];
    try {
        project = req?.query?.project?.trim().toLowerCase();
        if (!projects.includes(project)) {
            throw new Error("Invalid Project");
        }
        await configHelper.setAppSettings();
        let service;
        switch (project) {
            case "mailchimp":
                service = container.get<MailChimpService>(TYPES.MailChimpService);
                break;
            case "workfront":
                service = container.get<WorkfrontService>(TYPES.WorkfrontService);
                break;
            case "totalexpert":
                service = container.get<TotalExpertService>(TYPES.TotalExpertService);
                break;
            default:
                break;
        }
        customLogger.info(`Begin calling ${project}Service`);
        response = await service.saveDeltasToLake();
        customLogger.info(`End calling ${project}Service`);
        customLogger.logData(response);
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: error.stack, Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = {
            headers: headers,
            body: status === 400 ? ErrorService.invalidRequest : response || response,
            status,
        };
    }
};

export default httpTrigger;
