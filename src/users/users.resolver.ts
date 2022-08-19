import { UserService } from './users.service';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UseProfileOutput, UserProfileInput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-eamil.dto';

@Resolver((_) => User) // Entity
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

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

  /**
   *
   * @param authUser
   * @returns 나의 정보를 조회
   */
  @UseGuards(AuthGuard)
  @Query(() => User)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  /**
   *
   * @param userProfileInput
   * @returns 타인의 정보를 조회
   */
  @UseGuards(AuthGuard)
  @Query(() => UseProfileOutput)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UseProfileOutput> {
    try {
      const user = await this.userService.findById(userProfileInput.userId);
      if (!user) {
        throw Error();
      }
      return {
        ok: true,
        user,
      };
    } catch (e) {
      return {
        ok: false,
        error: '유저를 찾을 수 없습니다.',
      };
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => EditProfileOutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      await this.userService.editProfile(authUser.id, editProfileInput);
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  @Mutation(() => VerifyEmailOutput)
  async verifictionEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    try {
      await this.userService.verifyEmail(verifyEmailInput.code);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
