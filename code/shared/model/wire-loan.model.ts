import { BankField } from "./bank-field.model";
import { SourceFieldModel } from "./sourcefields.mode";

export class WireModel {
        _id?: string;
        bankFields?: BankField[];
        loanGuid?: string;
        bankCode: string;
        wireStatus?: string;
        fedRefNumber?: string;
        bank?: string;
        loanNumber?: string;
        borrowerLastName?: string;
        wireDate?: Date;
        sourceData?: SourceFieldModel;
        reason : string;
}