import { Expose } from "class-transformer";
import { IsNotEmpty, IsDefined } from "class-validator";

export class PayloadData {
    leadId: string;
    leadFirstName: string;
    leadLastName: string;
    leadPhoneNumber: string;
}

export class SendPushRequest {
    @Expose()
    @IsNotEmpty()
    eventName: string;

    @Expose()
    @IsNotEmpty()
    loUserName: string;

    @Expose()
    @IsDefined()
    payloadData: PayloadData;
}
