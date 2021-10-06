import { CustomValidator } from "./customValidator";
import { ServiceBase } from "../services/serviceBase";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { TYPES } from "../inversify/types";
import { LoanOfficerResponse } from "../model/loanOfficerResponse";
import { LoanOfficerService } from "../services/loanOfficer/loanOfficerService";

export class CustomValidatorImpl extends ServiceBase implements CustomValidator {
    private readonly loanOfficerService = this.resolve<LoanOfficerService>(TYPES.LoanOfficerService);

    /**
     * Converts the object into the given class
     * @param classType - class to convert object to and return
     * @param req - request object. HttpRequest.query or HttpRequest.body
     */
    convertToClass(classType: any, req: object): any {
        if (req === null || req === undefined) req = {};
        return plainToClass(classType, req, { excludeExtraneousValues: true });
    }

    /**
     * Validates the object against the class attributes
     * @param req - request object of a class type
     */
    async validate(req: object): Promise<string[]> {
        if (req === null || req === undefined) req = {};
        const errors = await validate(req);
        return errors.map(({ constraints }) => constraints[Object.keys(constraints)[0]]);
    }

    /**
     * Validates the object against the given schema
     * @param schema - class with validation attributes
     * @param req - request object. HttpRequest.query or HttpRequest.body
     */
    async convertAndValidate(schema: any, req: object): Promise<string[]> {
        if (req === null || req === undefined) req = {};
        const request: object = plainToClass(schema, req, { excludeExtraneousValues: true });
        const errors = await validate(request);
        return errors.map(({ constraints }) => constraints[Object.keys(constraints)[0]]);
    }

    public isFutureDate(date: string): boolean {
        try {
            if (!isNaN(Date.parse(date))) {
                const givenDate = new Date(date);
                const today = new Date(Date.now());
                return givenDate.getTime() > today.getTime();
            }
        } catch (error) {
            return false;
        }
        return false;
    }

    public async isValidUser(loEmail: string): Promise<boolean> {
        let loanOfficerResponse: LoanOfficerResponse;
        try {
            loanOfficerResponse = await this.loanOfficerService.getLoanOfficer(loEmail);
            return loanOfficerResponse?.data?._id === loEmail;
        } catch (error) {
            return false;
        }
    }

    public isMinBeforeMaxDate(minDate: string, maxDate: string): boolean {
        try {
            if (!isNaN(Date.parse(minDate))) {
                const min = new Date(minDate);
                const max = new Date(maxDate);
                return max.getTime() > min.getTime();
            }
        } catch (error) {
            return false;
        }
        return false;
    }

    public isDatesWeekApart(minDate: string, maxDate: string): boolean {
        try {
            if (!isNaN(Date.parse(minDate))) {
                const min = new Date(minDate);
                const max = new Date(maxDate);
                const diffInMs = Math.abs(max.getTime() - min.getTime());
                return diffInMs / (1000 * 60 * 60 * 24) < 7;
            }
        } catch (error) {
            return false;
        }
        return false;
    }
}
