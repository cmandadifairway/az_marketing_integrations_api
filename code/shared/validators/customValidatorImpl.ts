import { CustomValidator } from "./customValidator";
import { ServiceBase } from "../services/serviceBase";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

export class CustomValidatorImpl extends ServiceBase implements CustomValidator {
    private classTransformOptions = { excludeExtraneousValues: true };
    private validatorOptions = { forbidUnknownValues: true };

    /**
     * Converts the object into the given class
     * @param classType - class to convert object to and return
     * @param req - request object. HttpRequest.query or HttpRequest.body
     */
    convertToClass(classType: any, req: object): any {
        if (req === null || req === undefined) req = {};
        return plainToClass(classType, req, this.classTransformOptions);
    }

    /**
     * Validates the object against the class attributes
     * @param req - request object of a class type
     */
    async validate(req: object): Promise<string[]> {
        if (req === null || req === undefined) req = {};
        const errors = await validate(req, this.validatorOptions);
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
}
