import { Expose } from "class-transformer";
import { IsNotEmpty, Length, IsBoolean, IsDefined, IsUrl, IsDateString, Min } from "class-validator";

/**
 * API request definition
 * @Expose() is required to convert incoming request object to schema class.
 * class-validator's validate method validates only properties from the schema, other's will be ignored.
 *  Property that doesn't need any validation, must be added to this schema with @Allow() decorator, otherwise that property will be ignored.
 */
export class UpdateBannerRequest {
    @Expose()
    @IsNotEmpty()
    id: string;

    @Expose()
    @IsNotEmpty()
    @Length(1, 2000)
    message: string;

    @Expose()
    @IsNotEmpty()
    @Length(1, 2000)
    @IsUrl()
    url: string;

    @Expose()
    @IsDefined()
    @IsBoolean()
    active: boolean;

    @Expose()
    @IsDefined()
    @Min(1)
    viewLimit: number;

    @Expose()
    @IsNotEmpty()
    @IsDateString()
    expirationDate: string;

    @Expose()
    @IsNotEmpty()
    @Length(1, 100)
    username: string;
}
