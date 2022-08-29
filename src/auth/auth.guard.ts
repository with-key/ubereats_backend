import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

/***
 * AuthGuard의 역할 - req.headers에서 user의 정보를 받아 req의 진행을 계속할지 막을지 결정한다.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    // roles이 없으면 퍼블릭 설정
    if (!roles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];

    // user가 없으면 false
    if (!user) {
      return false;
    }

    // 권한이 Any인 API 접근 가능
    if (roles.includes('Any')) {
      return true;
    }

    // 설정된 API만 접근 가능
    return roles.includes(user.role);
  }
}
