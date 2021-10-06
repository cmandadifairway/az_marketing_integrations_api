import httpTrigger from "./index";
import { EmailServiceImpl } from "./service/EmailServiceImpl.service";
import { ContextMock, InvalidHttpRequestMock } from "../mock/azure.mock";
import { ErrorService } from "../shared/services/errorHandling/error.service";

describe("SendEmail", () => {
    test("when input is empty", async () => {
        await httpTrigger(ContextMock, InvalidHttpRequestMock);
        expect(ContextMock.res.body).toEqual(ErrorService.genericError);
    });

    test("Happy Path", async () => {
        const response = { Error: false, data: "Email sent successfully" };
        const spy = jest
            .spyOn(EmailServiceImpl.prototype, "sendEmail")
            .mockImplementation(() => Promise.resolve(response));

        const reqMock = { ...InvalidHttpRequestMock };
        reqMock.body = {
            to: "chandra.mandadi@fairwaymc.com",
            from: "no-reply@fairwaymc.com",
            text: "testing from postman",
            attachments: [],
        };
        await httpTrigger(ContextMock, reqMock);
        expect(spy).toHaveBeenCalled();
        expect(ContextMock.res.body).toEqual(response);
    });
});
