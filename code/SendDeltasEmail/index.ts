import { MarketingEmailService } from "../shared/services/emailHelper/marketingEmailService";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { Response } from "../shared/model/response";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { TYPES } from "../shared/inversify/types";
import { ConfigHelper } from "../shared/utils/config.helper";
import { IntegrationType } from "../shared/services/dataLake/dataLakeService";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "SendMailChimpEmail";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.query });
    const configHelper = container.get<ConfigHelper>(TYPES.ConfigHelper);
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
        const marketingEmailService = container.get<MarketingEmailService>(TYPES.MarketingEmailService);

        switch (project) {
            case "mailchimp":
                response = await marketingEmailService.sendMarketingEmail(IntegrationType.MailChimp);
                break;
            case "workfront":
                response = await marketingEmailService.sendMarketingEmail(IntegrationType.Workfront);
                break;
            case "totalexpert":
                response = await marketingEmailService.sendMarketingEmail(IntegrationType.TotalExpert);
                break;
            default:
                break;
        }
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
