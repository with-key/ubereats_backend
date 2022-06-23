import { Resolver, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  // Resolver에서 Root Query가 없으면 Error가 발생한다.
  // `Query root type must be provided.`
  @Query(() => Boolean)
  getUsers() {
    return true;
  }
}
