import { RelationshipService } from "../shared/services/relationship/relationshipService";
import { InviteUserRequest } from "./Model/inviteUserRequest";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AppInsightsService } from "../shared/services/monitoring/applicationInsights";
import { ErrorService } from "../shared/services/errorHandling/error.service";
import { container } from "../inversify.config";
import { TYPES } from "../shared/inversify/types";
import { CustomLogger } from "../shared/Logging/CustomLogger.service";
import { CustomValidator } from "../shared/validators/customValidator";
import { RelationshipResponse } from "../shared/model/relationship";
import { Response } from "../shared/model/response";
import { RegExPatterns } from "../shared/model/regexFormats";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const appInsightsService: AppInsightsService = container.get<AppInsightsService>(TYPES.AppInsightsService);
    const functionName = "InviteUser";
    await appInsightsService.StartService(context, functionName);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
    customLogger.logData({ msg: `HTTP trigger function for ${functionName} requested.`, request: req.body });

    let response: RelationshipResponse;
    let status = 200;
    triggerLabel: try {
        const requestData: InviteUserRequest = customValidator.convertToClass(InviteUserRequest, req.body);
        const errors = await validateInput(requestData);

        if (errors.length > 0) {
            status = 400;
            response = { data: errors, Error: true };
            break triggerLabel;
        }
        const relationshipService = container.get<RelationshipService>(TYPES.RelationshipService);
        response = await relationshipService.inviteUser(requestData);
        customLogger.logData(response);

        if (response.data === "Successfully added new user to the account.") {
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
 * Sends email to invitee informing that he has been given access
 * @param requestData
 * @param functionName
 */
async function sendEmail(requestData: InviteUserRequest, functionName: string) {
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);
    const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
    const relationshipService = container.get<RelationshipService>(TYPES.RelationshipService);
    try {
        const isValidUser = await customValidator.isValidUser(requestData.invitee);
        const resp: Response = await relationshipService.sendEmail(
            isValidUser
                ? UserRelationShipEmailType.inviteeIsFairywayUser
                : UserRelationShipEmailType.inviteeIsNotFairywayUser,
            requestData
        );
        resp.data = `${functionName}: ${resp.data}`;
        customLogger.logData(resp);
    } catch (error) {
        customLogger.error(`Error while sending email in ${functionName}`, error);
    }
}

async function validateInput(requestData: InviteUserRequest): Promise<string[] | string> {
    const relationshipService = container.get<RelationshipService>(TYPES.RelationshipService);
    const customValidator = container.get<CustomValidator>(TYPES.CustomValidator);
    const customLogger = container.get<CustomLogger>(TYPES.CustomLogger);

    const errors = await customValidator.validate(requestData);

    if (errors?.length === 0) {
        const isFairwayInvitee = requestData.invitee.match(RegExPatterns.FairwayDomain);
        if (!isFairwayInvitee) {
            errors.push("Invitee must be a Fairway user.");
        }

        // validate if the inviter is a loan officer
        const isValidUser = await customValidator.isValidUser(requestData.inviter);
        if (!isValidUser) {
            errors.push("The inviter must be a valid user.");
        }

        // validate if the invitee's email already exists for inviter
        let checkInviteeResponse = await relationshipService.checkInvitee(requestData.inviter, requestData.invitee);
        if (checkInviteeResponse?.data) {
            errors.push("User has already been invited.");
        }
    } else {
        const errorMsg = `Error in request parameters: ${errors.join(";")}`;
        customLogger.error(errorMsg, new Error(errorMsg));
        return ErrorService.invalidRequest;
    }
    return errors;
}

export default httpTrigger;
