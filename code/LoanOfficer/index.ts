import * as appInsights from "applicationinsights";
appInsights
    .setup() // assuming ikey is in env var
    .setAutoDependencyCorrelation(true, true)
    .setAutoCollectDependencies(true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();
const appInsightClient = appInsights.defaultClient;
import { LoanOfficerResponse } from "./model/loanOfficerResponse";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { ErrorService } from "../shared/service/errorHandling/error.service";
import { CustomLogger } from "../shared/utils/customLogger.service";
import { Response } from "../shared/model/response";
//import { AppInsightsService } from "../shared/service/monitoring/applicationInsights";
import { CustomValidator } from "../shared/validators/customValidator";
import { TYPES } from "../shared/inversify/types";
import { LoanOfficerRequest } from "./model/loanOfficerRequest";
import { LoanOfficerService } from "./service/LoanOfficer.service";

var os = require("os");
console.log(`os type ${os.type()}`);
var fs = require("fs");
console.log(`process.env.systemdrive: ${process.env.systemdrive}`);
var ICACLS_PATH = process.env.systemdrive + "/windows/system32/icacls.exe";
var test = fs.existsSync(ICACLS_PATH);
console.log(`existsSync ${test}`);

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    //const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "LoanOfficer";
    //await appInsightsService.startService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({
        msg: `HTTP trigger function for ${functionName} requested.`,
        request: req.query,
    });

    let response: Response;
    let loanOfficerResponse: LoanOfficerResponse;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: LoanOfficerRequest = customValidator.convertToClass(LoanOfficerRequest, req.query);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const loanOfficerService = container.get<LoanOfficerService>(TYPES.LoanOfficerServiceImpl);
        loanOfficerResponse = await loanOfficerService.getLoanOfficer(requestData.loEmail);
        customLogger.logData(loanOfficerResponse);
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = {
            headers: headers,
            body: status === 400 ? ErrorService.invalidRequest : response || loanOfficerResponse,
            status,
        };
    }
};

export default httpTrigger;
