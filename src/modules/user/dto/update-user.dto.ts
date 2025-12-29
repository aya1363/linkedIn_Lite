import { IsDateString, IsEnum, IsNotEmpty, IsString, Length, Matches } from "class-validator";
import {  GenderEnum, IsAdult } from "src/common";


export class UpdateUserDto  {
    @Length(2, 25, {
    message: 'first name min length min 2 and max 25 characters',
    })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @Length(2, 25)
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsDateString()
    @IsAdult({ message: 'Age must be 18 or older' })
    DOB: Date;

    @Matches(/^(?:\+?20|0020)?0?(10|11|12|15)[0-9]{8}$/)
    phoneNumber: string;
    @IsEnum(GenderEnum)
    gender:string 
}
