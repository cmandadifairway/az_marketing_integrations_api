import { container } from "../../inversify.config";
import { TYPES } from "../../shared/inversify/types";
import { EmailServiceImpl } from "./EmailServiceImpl.service";
import { EmailService, EmailMessage } from "./Email.service";
import { Response } from "../../shared/model/response";
import { AppConfigService } from "../../shared/services/appConfiguration/appConfig.service";

describe("SendEmail Service", () => {
    test("Service should send an email", async () => {
        const appConfigService = container.get<AppConfigService>(TYPES.AppConfigService);
        const input: EmailMessage = {
            from: appConfigService.getDefaultFromEmailAddress(),
            to: "chandra.mandadi@fairwaymc.com",
            subject: "test",
            text: "",
            html: "<html>This is test</html>",
            attachments: [],
        };
        const response: Response = { data: "Email sent successfully", Error: false };
        const spy = jest
            .spyOn(EmailServiceImpl.prototype, "sendEmail")
            .mockImplementation(() => Promise.resolve(response));
        const emailService: EmailService = container.get<EmailService>(TYPES.EmailServiceImpl);
        const emailMessage: EmailMessage = input;
        const result = await emailService.sendEmail(emailMessage);
        expect(spy).toHaveBeenCalled();
        expect(result).toBe(response);
    });
});
