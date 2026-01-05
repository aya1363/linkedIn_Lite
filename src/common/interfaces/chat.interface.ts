import { Types } from "mongoose";
import { IUser } from "./user.interface";

export interface IChat {
  _id: Types.ObjectId;
  sender: IUser | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  receiver: IUser | Types.ObjectId;
}