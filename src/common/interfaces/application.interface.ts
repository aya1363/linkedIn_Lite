import { Types } from "mongoose";
import { IJob } from "./job.interface";
import { ApplicationStatus } from "../enums";
import { IUser } from "./user.interface";

export interface IApplication {
    _id: Types.ObjectId;
    jobId: Types.ObjectId | IJob;
    userCV: string;
    status: ApplicationStatus;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy: IUser | Types.ObjectId;
}