import { UserService } from './users.service';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';

@Resolver((_) => User) // Entity
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

  @Query((_) => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const error = await this.userService.createAccount(createAccountInput);
      if (error) {
        return {
          ok: false,
          error,
        };
      }
      return {
        ok: true,
      };
    } catch (e) {
      //
    }
  }

  // 로그인
  @Mutation(() => LoginOutput)
  async login(@Args('input') loginIput: LoginInput): Promise<LoginOutput> {
    try {
      return await this.userService.login(loginIput);
    } catch (error) {
      return {
        ok: false,
        error: error,
      };
    }
  }

  @Query(() => User)
  me(@Context() context) {
    console.log(context.user);
    if (!context.user) {
      return;
    } else {
      return context.user;
    }
  }
}
