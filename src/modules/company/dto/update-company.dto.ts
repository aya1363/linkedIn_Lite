import { Types } from "mongoose";
import {
    IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { Type } from "class-transformer";
import { MongoIdsValidate } from "src/common";


export class CompanyParamsDto{
    @IsMongoId()
    companyId:Types.ObjectId
}
export class UpdateCompanyDto {
  @IsOptional()
  @MaxLength(1000)
  @MinLength(5)
  @IsString()
  name?: string;

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
  @IsArray()
  hrs: Types.ObjectId[];

  @Validate(MongoIdsValidate)
  removedHrs?: Types.ObjectId[];
}
