import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { tokenName } from 'src/common/decorators';
import { tokenEnum } from 'src/common/enums';
import { TokenService } from 'src/common/services';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType: tokenEnum =
      this.reflector.getAllAndOverride<tokenEnum>(tokenName, [
        context.getHandler(),
        context.getClass(),
      ]) ?? tokenEnum.access;

    let req: any;
    let authorization: string | undefined;

    /* ================= HTTP ================= */
    if (context.getType<'http'>() === 'http') {
      const httpCtx = context.switchToHttp();
      req = httpCtx.getRequest();
      authorization = req.headers.authorization;
    } else if (context.getType<'graphql'>() === 'graphql') {

    /* ================= GraphQL ================= */
      const gqlCtx = GqlExecutionContext.create(context);
      req = gqlCtx.getContext().req;
      authorization = req?.headers?.authorization;
    } else {
      throw new UnauthorizedException('Unsupported request context');
    }

    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const { decoded, user } = await this.tokenService.decodeToken({
      authorization,
      tokenType,
    });

    // 🔥 نفس الstructure بتاع REST
    req.credentials = { decoded, user };

    return true;
  }
}
