import {  IsArray, IsEnum, IsMongoId, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Types } from "mongoose";
import {  JobLocation, SeniorityLevel, WorkingTime } from "src/common";

export class CreateJobDto {

  @IsString()
  @MaxLength(1000)
  @MinLength(10)
  @IsNotEmpty()
  jobTitle: string;
  @IsString()
  @MaxLength(10000)
  @MinLength(10)
  @IsNotEmpty()
  jobDescription?: string;
  @IsEnum(JobLocation)
  jobLocation: JobLocation;
  @IsString({ each: true })
  @IsArray()
  technicalSkills: string[];
  @IsEnum(SeniorityLevel)
  seniorityLevel: SeniorityLevel;
  @IsArray()
  @IsString({ each: true })
  softSkills: string[];
  @IsEnum(WorkingTime)
  workingTime: WorkingTime;
}
export class JobParamsDto{
    @IsMongoId()
    jobId:Types.ObjectId
}
