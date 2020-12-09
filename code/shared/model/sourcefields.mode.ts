export class SourceFieldModel {
    bankCode: string;
    loanGuid: string;
    bankFields: SourceBankFieldModel[];
}

export class SourceBankFieldModel {
    fieldName: string;
    fieldValue: string;
}