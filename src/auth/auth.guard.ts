import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/***
 * AuthGuard의 역할 - req.headers에서 user의 정보를 받아 req의 진행을 계속할지 막을지 결정한다.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    if (!user) {
      return false;
    } else {
      return true;
    }
  }
}
