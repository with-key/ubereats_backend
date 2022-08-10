import { createParamDecorator } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContextHost) => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];

    return user;
  },
);
