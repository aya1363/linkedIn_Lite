
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => ID)
  _id: string;

  @Field()
  userName: string;

  @Field()
  email: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  profilePicture?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class CompanyType {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  legalAttachment: string;

  @Field()
  approvedByAdmin: boolean;

  @Field({ nullable: true })
  logo?: string;

  @Field()
  createdAt: Date;

  @Field()
  createdBy: string;
}

@ObjectType()
export class DashboardType {
  @Field(() => [UserType])
  users: UserType[];

  @Field(() => [CompanyType])
  companies: CompanyType[];
}
