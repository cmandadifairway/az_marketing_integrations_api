import { Expose } from "class-transformer";
import { IsNotEmpty, Matches } from "class-validator";
import { RegExPatterns } from "../../shared/model/regexFormats";

/**
 * API request schema definition
 * @Expose() is required to convert incoming request object to schema class.
 * class-validator's validate method validates only properties from the schema, other's will be ignored.
 *  Property that doesn't need any validation, must be added to this schema with @Allow() decorator, otherwise that property will be ignored.
 */
export class GroupLOsRequest {
    @Expose()
    @IsNotEmpty()
    @Matches(RegExPatterns.GroupId)
    campaignGroup: string;
}
