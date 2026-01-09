import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IJob } from '../../common';
import {JobLocation, SeniorityLevel, WorkingTime} from '../../common/enums'

@Schema({
  strict: true,
  strictQuery: true,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Job implements IJob {
  @Prop({
    type: String,
    enum: WorkingTime,
    default: WorkingTime.FullTime,
  })
  workingTime: WorkingTime;
  @Prop({
    type: String,
    enum: JobLocation,
    default: JobLocation.OnSite,
  })
  jobLocation: JobLocation;

  @Prop({
    type: String,
    enum: SeniorityLevel,
  })
  seniorityLevel: SeniorityLevel;
  @Prop({
    type: [String],
  })
  technicalSkills: string[];
  @Prop({
    type: [String],
  })
  softSkills: string[];
  @Prop({
    type: String,
    required: true,
    trim: true,
    minLength: 10,
    maxLength: 1000,
  })
  jobTitle: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  updatedBy?: Types.ObjectId;
  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
  })
  companyId: Types.ObjectId;
  @Prop({
    type: Types.ObjectId,
      ref: 'User',
    required:true
  })
  addedBy: Types.ObjectId;
  @Prop({
    type: String,
    required: true,
    trim: true,
    minLength: 10,
    maxLength: 10000,
  })
  jobDescription?: string;
  @Prop({
    type: Boolean,
    default: false,
  })
  closed: boolean;
}

export type JobDocument = HydratedDocument<Job>;
export const jobSchema = SchemaFactory.createForClass(Job);

jobSchema.pre(['findOne', 'find', 'findOneAndUpdate'], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
    next();
});


export const JobModel = MongooseModule.forFeature([
    { name: Job.name, schema: jobSchema },
]);
