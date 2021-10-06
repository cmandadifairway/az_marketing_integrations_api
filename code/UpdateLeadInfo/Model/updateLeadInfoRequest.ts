import { Expose } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, Length } from "class-validator";

/**
 * API request schema definition
 * @Expose() is required to convert incoming request object to schema class.
 * class-validator's validate method validates only properties from the schema, other's will be ignored.
 * Property that doesn't need any validation, must be added to this schema with @Allow() decorator, otherwise that property will be ignored.
 */
export class UpdateLeadInfoRequest {
    @Expose()
    @IsNotEmpty()
    id: string;

    @Expose()
    @IsOptional()
    @IsNumber()
    leadRating: number;

    @Expose()
    @IsOptional()
    @IsArray()
    loanStatus: Array<string>;

    @Expose()
    @IsOptional()
    @Length(0, 100)
    referral: string;

    @Expose()
    @IsOptional()
    @Length(0, 100)
    referredTo: string;

    @Expose()
    @IsOptional()
    @Length(0, 1000)
    leadNotes: string;
}
