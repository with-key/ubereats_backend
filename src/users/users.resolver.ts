import { UserService } from './users.service';
import { Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';

@Resolver((_) => User) // Entity
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

  @Query((_) => Boolean)
  hi() {
    return true;
  }
}
