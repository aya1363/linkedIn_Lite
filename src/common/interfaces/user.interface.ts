import { Types } from "mongoose";
import { GenderEnum, PreferredLanguage, ProviderEnum, RoleEnum } from "../enums";
import { OtpDocument } from "src/DB/Model";


export interface IUser {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  firstName: string;
  lastName: string;
  userName: string;

  DOB: Date;
  email: string;
  phoneNumber: string;

  confirmedAt?: Date;
  changeCredentialTime?: Date;

  password?: string;
  gender: GenderEnum;
  provider: ProviderEnum;
  role: RoleEnum;
  preferredLanguage: PreferredLanguage;

  updatedBy?: Types.ObjectId; // ← fixed

  profilePicture?: string;
  coverPictures?: string[];

  deletedAt?: Date;
  bannedAt?: Date;

  otp?: OtpDocument[];
}

