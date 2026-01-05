import { Types } from 'mongoose';
import { IUser } from './user.interface';
import { ICompany } from './company.interface';
import { JobLocation, SeniorityLevel, WorkingTime } from '../enums/jobs.enum';


export interface IJob {
    _id?: Types.ObjectId;
    jobTitle: string;
    seniorityLevel: SeniorityLevel;
    jobLocation: JobLocation;
    workingTime: WorkingTime;
    jobDescription?: string;
    technicalSkills: string[];
    softSkills: string[];
    companyId: Types.ObjectId | ICompany;
    createdAt?: Date;
    updatedAt?: Date;
    closed:boolean
    addedBy: IUser | Types.ObjectId;
    updatedBy?: IUser | Types.ObjectId;
}

