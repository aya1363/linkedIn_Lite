import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GenderEnum, PreferredLanguage, ProviderEnum, RoleEnum } from '../../common/enums';
import { OtpDocument } from './otp.model';
import { generateHash } from '../../common';
import { IUser } from '../../common';
import { decrypt, encrypt } from 'src/common/utils/security/cypto.security';

@Schema({
  strictQuery: true,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User implements IUser {
  @Prop({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 15,
    trim: true,
  })
  firstName: string;
  @Prop({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 15,
    trim: true,
  })
  lastName: string;

  @Virtual({
    get: function (this: User) {
      return `${this.firstName} ${this.lastName}`;
    },
    set: function (value: string) {
      const [firstName, lastName] = value.split(' ') || [];
      this.set({ firstName, lastName });
    },
  })
  userName: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;
  @Prop({
    type: Date,
    required: function () {
      return this.DOB > Date.now();
    },
  })
  DOB: Date;

  @Prop({
    type: String,
    required: true,
  })
  phoneNumber: string;

  @Prop({
    type: Date,
  })
  confirmedAt: Date;
  @Prop({
    type: Date,
  })
  deletedAt: Date;

  @Prop({
    type: Date,
  })
  bannedAt: Date;
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  updatedBy: Types.ObjectId;
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  createdBy: Types.ObjectId;

  @Prop({
    type: Date,
  })
  changeCredentialTime: Date;

  @Prop({
    type: String,
    password: {
      type: String,
      required: function () {
        return this.provider !== ProviderEnum.GOOGLE;
      },
    },
  })
  password: string;
  @Prop({
    type: String,
    enum: GenderEnum,
    default: GenderEnum.Male,
  })
  gender: GenderEnum;
  @Prop({
    type: String,
    enum: ProviderEnum,
    default: ProviderEnum.SYSTEM,
    required: function (this: User) {
      return this.provider === ProviderEnum.GOOGLE ? false : true;
    },
  })
  provider: ProviderEnum;

  @Prop({
    type: String,
    enum: RoleEnum,
    default: RoleEnum.user,
  })
  role: RoleEnum;

  @Prop({
    type: String,
    enum: PreferredLanguage,
    default: PreferredLanguage.EN,
  })
  preferredLanguage: PreferredLanguage;

  @Prop({
    type: String,
  })
  profilePicture?: string;
  @Prop({
    type: [String],
  })
  coverPictures?: string[];

  @Virtual()
  otp: OtpDocument[];
}


export const userSchema = SchemaFactory.createForClass(User)


userSchema.virtual('otp', {
    localField: '_id',
    foreignField: 'createdBy',
    ref:'Otp'
})
userSchema.pre(['findOne', 'find', 'findOneAndUpdate'], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
    next();
});


userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await generateHash({plainText:this.password})
    }
    next()
})

userSchema.post(['findOne','findOneAndUpdate'], async function (doc) {
  if (doc && doc.phoneNumber) {
    doc.phoneNumber = await decrypt(doc.phoneNumber);
  }
});
userSchema.pre('save', async function (next) {
  if (this.isModified('phoneNumber')) {
    this.phoneNumber = await encrypt(this.phoneNumber);
  }
  next();
});


export type UserDocument = HydratedDocument<User>
export const UserModel = MongooseModule.forFeature([{name:User.name ,schema:userSchema}])