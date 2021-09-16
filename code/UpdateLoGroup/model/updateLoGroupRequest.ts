import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, Length, IsIn } from "class-validator";

/**
 * API request schema definition
 * @Expose() is required to convert incoming request object to schema class.
 * class-validator's validate method validates only properties from the schema, other's will be ignored.
 *  Property that doesn't need any validation, must be added to this schema with @Allow() decorator, otherwise that property will be ignored.
 */
export class UpdateLoGroupRequest {
    @Expose()
    @IsNotEmpty()
    @IsIn(["add", "remove"])
    action: string;

    @Expose()
    @IsNotEmpty()
    @IsIn(["primary", "backup"])
    groupType: string;

    @Expose()
    @IsNotEmpty()
    @Length(0, 50)
    groupId: string;

    @Expose()
    @IsNotEmpty()
    @IsEmail()
    loEmail: string;
}
