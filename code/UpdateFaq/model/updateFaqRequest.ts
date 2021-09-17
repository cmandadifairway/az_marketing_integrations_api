import { Expose } from "class-transformer";
import { IsNotEmpty, Length, IsIn, IsBoolean, IsOptional, IsNumber, IsDefined } from "class-validator";

/**
 * API request schema definition
 * @Expose() is required to convert incoming request object to schema class.
 * class-validator's validate method validates only properties from the schema, other's will be ignored.
 *  Property that doesn't need any validation, must be added to this schema with @Allow() decorator, otherwise that property will be ignored.
 */
export class UpdateFaqRequest {
    @Expose()
    @IsNotEmpty()
    id: string;

    @Expose()
    @IsNotEmpty()
    @Length(0, 1000)
    question: string;

    @Expose()
    @IsNotEmpty()
    @Length(0, 2000)
    answer: string;

    @Expose()
    @IsNotEmpty()
    @IsIn(["text", "html", "image", "video"])
    answerType: string;

    @Expose()
    @IsNotEmpty()
    @IsBoolean()
    active: boolean;

    @Expose()
    @IsNotEmpty()
    @Length(0, 100)
    category: string;

    @Expose()
    @IsDefined()
    @IsNumber()
    orderBy: number;

    @Expose()
    @IsOptional()
    @Length(0, 100)
    username: string;
}
