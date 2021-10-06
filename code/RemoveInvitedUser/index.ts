import { InviteUserRequest } from "./../InviteUser/Model/inviteUserRequest";
import { RelationshipService } from "../shared/services/relationship/relationshipService";
import { RemoveInvitedUserRequest } from "./Model/removeInvitedUserRequest";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { Response } from "../shared/model/response";
import { CustomValidator } from "../shared/validators/customValidator";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "RemoveInvitedUser";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.body });

    let response: Response;
    let status = 200;
    triggerLabel: try {
        const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
        const requestData: RemoveInvitedUserRequest = customValidator.convertToClass(
            RemoveInvitedUserRequest,
            req.body
        );
        const errors = await validateInput(requestData);

        if (errors.length > 0) {
            status = 400;
            response = { data: errors, Error: true };
            break triggerLabel;
        }

        const relationshipService = container.get<RelationshipService>(TYPES.RelationshipService);
        response = await relationshipService.removeInvitedUser(requestData);
        customLogger.logData(response);

        if (response.data === "Successfully removed user from the account.") {
            // send email asynchronously
            sendEmail(requestData, functionName);
        }
    } catch (error) {
        customLogger.error(`${functionName} httpTrigger`, error);
        response = { data: ErrorService.getFriendlyErrorMsg(), Error: true };
    } finally {
        const headers = { "Content-Type": "application/json" };
        context.res = { headers: headers, body: response, status };
    }
};

/**
 * Sends email to invitee informing him that his access has been removed
 * @param requestData
 * @param functionName
 */
async function sendEmail(requestData: RemoveInvitedUserRequest, functionName: string) {
    const relationshipService = container.get<RelationshipService>(TYPES.RelationshipService);
    const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    try {
        const inviteUserRequest: InviteUserRequest = {
            invitee: requestData.invitee,
            inviter: requestData.inviter,
            role: "",
        };
        const resp: Response = await relationshipService.sendEmail(
            UserRelationShipEmailType.removedInvitee,
            inviteUserRequest
        );
        customLogger.logData(resp);
    } catch (error) {
        customLogger.error(`Error while sending email in ${functionName}`, error);
    }
}

async function validateInput(requestData: RemoveInvitedUserRequest): Promise<string[] | string> {
    const relationshipService = container.get<RelationshipService>(TYPES.RelationshipService);
    const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);

    const errors = await customValidator.validate(requestData);

    if (errors?.length === 0) {
        // validate if the inviter is a loan officer
        const isValidUser = await customValidator.isValidUser(requestData.inviter);
        if (!isValidUser) {
            errors.push("The inviter must be a valid user.");
        }

        // validate if the invitee's email already exists for inviter
        let checkInviteeResponse = await relationshipService.checkInvitee(requestData.inviter, requestData.invitee);
        if (!checkInviteeResponse?.data) {
            errors.push("Invitee does not exist.");
        }
    } else {
        const errorMsg = `Error in request parameters: ${errors.join(";")}`;
        customLogger.error(errorMsg, new Error(errorMsg));
        return ErrorService.invalidRequest;
    }
    return errors;
}

export default httpTrigger;
