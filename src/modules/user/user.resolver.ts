import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { DashboardType } from './type/dashboard.types'
import { Auth, RoleEnum } from 'src/common';

@Resolver(() => DashboardType)
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => DashboardType, { name: 'Dashboard' })
  @Auth([RoleEnum.admin, RoleEnum.superAdmin])
  async Dashboard(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return this.userService.Dashboard({ page, limit });
  }
}
