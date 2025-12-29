import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { roleName } from 'src/common/decorators/role.type.decorator';
import { RoleEnum } from 'src/common/enums';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const accessRoles: RoleEnum[] =
      this.reflector.getAllAndOverride<RoleEnum[]>(roleName, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    // 🔹 لو مفيش roles محددة → السماح
    if (accessRoles.length === 0) return true;

    let role: RoleEnum;

    /* ================= HTTP ================= */
    if (context.getType<'http'>() === 'http') {
      role = context.switchToHttp().getRequest().credentials?.user?.role;
    } else if (context.getType<'graphql'>() === 'graphql') {

    /* ================= GraphQL ================= */
      const gqlCtx = GqlExecutionContext.create(context);
      role = gqlCtx.getContext().req?.credentials?.user?.role;
    } else {
      return false;
    }

    console.log({ accessRoles, role });

    return accessRoles.includes(role);
  }
}
