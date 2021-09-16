export interface CustomValidator {
    convertToClass: (classType: any, req: object) => any;
    validate: (objectToValidate: object) => Promise<string[]>;
    convertAndValidate: (classSchema: any, objectToValidate: object) => Promise<string[]>;
    isFutureDate: (date: string) => boolean;
    isValidUser: (loEmail: string) => Promise<boolean>;
    isMinBeforeMaxDate: (minDate: string, maxDate: string) => boolean;
    isDatesWeekApart: (minDate: string, maxDate: string) => boolean;
}
