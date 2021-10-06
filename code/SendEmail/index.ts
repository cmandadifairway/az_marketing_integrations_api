import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { container } from "../inversify.config";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { Response } from "../shared/model/response";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { UtilityService } from "../shared/utils/utility.service";
import { CustomValidator } from "../shared/validators/customValidator";
import { TYPES } from "../shared/inversify/types";
import { SendEmailRequest } from "./Model/sendEmailRequest";
import { EmailAttachment, EmailMessage, EmailService } from "./service/Email.service";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "SendEmail";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    const requestData = req.body;
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: requestData });

    let response: Response;
    let status = 200;
    try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const errors = await customValidator.convertAndValidate(SendEmailRequest, requestData);
        const errors1 = isValidMessage(requestData);
        let allErrors = errors.concat(errors1);
        if (allErrors.length > 0) {
            status = 400;
            throw new Error(`Error in request body: ${allErrors.join(";")}`);
        }

        customLogger.info(`HTTP trigger ${functionName} started`);
        const emailMessage: EmailMessage = requestData;
        const emailService: EmailService = container.get<EmailService>(TYPES.EmailServiceImpl);
        response = await emailService.sendEmail(emailMessage);
        customLogger.info(`HTTP trigger ${functionName} ended`);
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = { headers: headers, body: status === 400 ? ErrorService.invalidRequest : response, status };
    }
};

/**
 * Validates the input
 * @param msg
 * @returns errors if required fields are missing
 */
function isValidMessage(msg: EmailMessage): string[] {
    let errors: string[] = [];
    const utility = container.get<UtilityService>(TYPES.UtilityService);

    if (utility.convertNullToString(msg.html) === "" && utility.convertNullToString(msg.text) === "") {
        errors.push("text or html is required");
    }
    if (utility.convertNullToString(msg.html) !== "" && utility.convertNullToString(msg.text) !== "") {
        errors.push("Cannot send both html and text, please provide either one");
    }
    if (msg.attachments?.length > 0) {
        let index = 0;
        msg.attachments.forEach((attachment) => {
            const field = `attachment[${index}]`;
            if (typeof attachment === "object") {
                try {
                    const att: EmailAttachment = attachment;
                    if (utility.convertNullToString(att.content) === "") {
                        errors.push("Attachment content cannot be empty");
                    }
                    if (utility.convertNullToString(att.filename) === "") {
                        errors.push("Attachment filename cannot be empty");
                    }
                    if (utility.convertNullToString(att.type) === "") {
                        errors.push("Attachment type cannot be empty");
                    }
                } catch (error) {
                    errors.push("Attachment is not a valid object");
                }
            } else {
                errors.push("Attachment is not a valid object");
            }
            index++;
        });
    }
    return errors;
}

export default httpTrigger;
