import { Types } from 'mongoose';
import { IUser } from './user.interface';


export interface ICompany {
  _id?: Types.ObjectId;
  name: string;
  numberOfEmployees: number;
  industry: string;
  legalAttachment: string;
  approvedByAdmin: boolean;
  address?: string;
  email: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  hrs?: Types.ObjectId[] | IUser;
  assetFolderId?: string;

  createdAt?: Date;
  updatedAt?: Date;
  bannedAt?: Date;
  deletedAt: Date;
  restoredAt?: Date;
  createdBy: IUser | Types.ObjectId;
  bannedBy?: IUser | Types.ObjectId;
  updatedBy?: IUser | Types.ObjectId;
}
