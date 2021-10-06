import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { ErrorService } from "../shared/service/errorHandling/error.service";
import { CustomLogger } from "../shared/utils/customLogger.service";
import { AppInsightsService } from "../shared/service/monitoring/applicationInsights";
import { CustomValidator } from "../shared/validators/customValidator";
import { TYPES } from "../shared/inversify/types";
import { loByNameRequest } from "./model/loByNameRequest";
import { LOByNameService } from "./service/LOByName.service";
import { LoanOfficerByNameResponse } from "./model/loanOfficerByNameResponse";

const loByName: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "LoanOfficerByName";
    await appInsightsService.startService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({
        msg: `HTTP trigger function for ${functionName} requested.`,
        request: req.query,
    });

    // This api doesnt match because its called by 3rd party component
    let loanOfficers: any;
    let loanOfficerByNameResponse: LoanOfficerByNameResponse;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: loByNameRequest = customValidator.convertToClass(loByNameRequest, req.query);
        const errors = await customValidator.validate(requestData);
        if (errors.length > 0) {
            status = 400;
            throw new Error(`Error in request parameters: ${errors.join(";")}`);
        }

        const loByNameService = container.get<LOByNameService>(TYPES.LOByNameServiceImpl);
        loanOfficerByNameResponse = await loByNameService.getLoanOfficerByName(requestData.loName);
        loanOfficers = loanOfficerByNameResponse.data;
        customLogger.logData(loanOfficers);
    } catch (error) {
        if (status !== 400) {
            status = 500;
        }
        customLogger.error(`${functionName} httpTrigger`, error);
        loanOfficers = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = {
            headers: headers,
            body: status === 400 ? ErrorService.invalidRequest : loanOfficers,
            status,
        };
    }
};

export default loByName;
