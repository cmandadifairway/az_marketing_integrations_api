import { Expose } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional, Matches, IsNumber } from "class-validator";
import { RegExPatterns } from "../../shared/model/regexFormats";

/**
 * API request schema definition
 * @Expose() is required to convert incoming request object to schema class.
 * class-validator's validate method validates only properties from the schema, other's will be ignored.
 *  Property that doesn't need any validation, must be added to this schema with @Allow() decorator, otherwise that property will be ignored.
 */
export class LeadsRequest {
    @Expose()
    @IsNotEmpty()
    @IsEmail()
    loEmail: string;

    @Expose()
    @IsOptional()
    @IsBoolean()
    isEngaged: boolean;

    @Expose()
    @IsOptional()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    engagedMinDate: string;

    @Expose()
    @IsOptional()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    engagedMaxDate: string;

    @Expose()
    @IsOptional()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    createdMinDate: string;

    @Expose()
    @IsOptional()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    createdMaxDate: string;

    @Expose()
    @IsOptional()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    ltMinDate: string;

    @Expose()
    @IsOptional()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    ltMaxDate: string;

    @Expose()
    @IsOptional()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    minDate: string;

    @Expose()
    @IsOptional()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    maxDate: string;

    @Expose()
    @IsOptional()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    qualifiedMinDate: string;

    @Expose()
    @IsOptional()
    @Matches(RegExPatterns.YearMonthDateWithHyphen)
    qualifiedMaxDate: string;

    @Expose()
    @IsOptional()
    @IsNumber()
    leadRating: number;

    @Expose()
    @IsOptional()
    @IsArray()
    loanStatus: Array<string>;

    // TODO clean up this property reference - remove the boolean type expectation and minDate/maxDate props
    @Expose()
    @IsOptional()
    liveTransfer: Array<string> | boolean;

    @Expose()
    @IsOptional()
    loanType: Array<string>;

    @Expose()
    @IsOptional()
    currentLeadStatus: Array<string>;

    @Expose()
    @IsOptional()
    loanSource: Array<string>;

    @Expose()
    @IsOptional()
    state: Array<string>;
}
