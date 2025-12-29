import { IsMongoId, IsOptional } from 'class-validator';

export class UserParamsDto {
  @IsMongoId()
  @IsOptional()
  userId?: string;
}

export class UserParamDto {
  @IsMongoId()
  @IsOptional()
  userId: string;
}
