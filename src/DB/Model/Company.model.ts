import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { ICompany } from 'src/common';


@Schema({
  timestamps: true,
  strictQuery: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Company implements ICompany {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    minLength: 5,
    maxLength: 1000,
    type: String,
  })
  name: string;

  @Prop({
    type: Number,
    min: 11,
    max: 20,
  })
  numberOfEmployees: number;

  @Prop({
    type: String,
    trim: true,
    minLength: 5,
    maxLength: 1000,
  })
  industry: string;
  @Prop({
    type: String,
  })
  legalAttachment: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  approvedByAdmin: boolean;
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    type: String,
  })
  email: string;
  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  logo?: string;
  @Prop({ type: String })
  address?: string;
  @Prop({ type: String })
  coverImage?: string;
  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
  })
  hrs: Types.ObjectId[];
  @Prop({
    type: String,
  })
  assetFolderId?: string;
  @Prop({
    type: Date,
  })
  bannedAt?: Date;
  @Prop({
    type: Date,
  })
  restoredAt?: Date;
  @Prop({
    type: Date,
  })
  deletedAt: Date;
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  createdBy: Types.ObjectId;
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  updatedBy?: Types.ObjectId;
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  bannedBy?: Types.ObjectId;
}
export type CompanyDocument = HydratedDocument<Company>;
export const companySchema = SchemaFactory.createForClass(Company);

//companySchema.pre('save', function (next) {
  // console.log(this);

  //if (this.isModified('name')) {
 //   this.slug = slugify(this.name);
 // }
 // next();
//});

companySchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
  const update = this.getUpdate() as UpdateQuery<Company>;
  if (update.name) {
    this.setUpdate({ ...update, slug: slugify(update.name) });
  }
  next();
});

companySchema.pre(['findOne', 'find', 'findOneAndUpdate'], function (next) {
  const query = this.getQuery();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
  next();
});

export const CompanyModel = MongooseModule.forFeature([
  { name: Company.name, schema: companySchema },
]);
