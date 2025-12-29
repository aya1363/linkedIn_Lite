import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber, IsPositive, IsString, Max, MaxLength, Min, MinLength, Validate } from "class-validator";
import { Types } from "mongoose";
import { MongoIdsValidate } from "src/common";

export class CreateCompanyDto {
  @IsEmail()
  email: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Max(20)
  @Min(11)
  numberOfEmployees: number;
  @MaxLength(1000)
  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  name: string;

  @MaxLength(1000)
  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  industry: string;
  @MaxLength(1000)
  @MinLength(5)
  @IsString()
  address: string;
  @MaxLength(1000)
  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  description: string;

  @Validate(MongoIdsValidate)
  hrs: Types.ObjectId[];
}
