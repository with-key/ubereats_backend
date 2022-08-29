import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { RestaurantsService } from './restaurants.service';

@Resolver()
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}
  @Mutation(() => CreateRestaurantOutput)
  @Role(['Owner']) // 접근 가능한 권한 설정
  createRestaurant(
    @Args('createRestaurantInput') createRestaurantInput: CreateRestaurantInput,
    @AuthUser() user: User,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(user, createRestaurantInput);
  }
}