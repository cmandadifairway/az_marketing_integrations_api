export interface CustomValidator {
    convertToClass: (classType: any, req: object) => any;
    validate: (objectToValidate: object) => Promise<string[]>;
    isFutureDate: (date: string) => boolean;
}
