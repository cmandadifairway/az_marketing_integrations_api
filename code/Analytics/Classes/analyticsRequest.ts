import { RegExPatterns } from "../../shared/model/regexFormats";
import { IsEmail, IsNotEmpty, IsIn, Matches } from "class-validator";
import { DateFrequency } from "./dateFrequency";
import { Expose } from "class-transformer";

/**
 * API request schema definition
 * @Expose() is required to convert incoming request object to schema class.
 * class-validator's validate method validates only properties from the schema, other's will be ignored.
 *  Property that doesn't need any validation, must be added to this schema with @Allow() decorator, otherwise that property will be ignored.
 */
export class AnalyticsRequest {
    @Expose()
    @IsNotEmpty()
    @IsEmail()
    loEmail: string;

    @Expose()
    @IsNotEmpty()
    @IsIn([DateFrequency.DAY, DateFrequency.MONTH])
    frequency: string;

    @Expose()
    @IsNotEmpty()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    minDate: string;

    @Expose()
    @IsNotEmpty()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    maxDate: string;
}
