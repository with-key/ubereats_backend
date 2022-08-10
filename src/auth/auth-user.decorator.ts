import { createParamDecorator } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * AuthUser의 역할: context에서 user의 정보를 조회해서 반환해준다.
 */
export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContextHost) => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    return user;
  },
);
