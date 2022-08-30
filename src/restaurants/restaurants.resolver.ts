import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { RestaurantsService } from './restaurants.service';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dto/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dto/all-category.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';

@Resolver()
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Mutation(() => CreateRestaurantOutput)
  @Role(['Owner']) // 접근 가능한 권한 설정
  createRestaurant(
    @Args('createRestaurantInput') createRestaurantInput: CreateRestaurantInput,
    @AuthUser() user: User,
  ): Promise<CreateRestaurantOutput> {
    console.log(user);
    return this.restaurantService.createRestaurant(user, createRestaurantInput);
  }

  @Mutation(() => EditRestaurantOutput)
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input')
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(() => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ) {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }
}

@Resolver((of) => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Query(() => AllCategoriesOutput)
  getAllCategories() {
    return this.restaurantService.getAllCategories();
  }

  @Query(() => CategoryOutput)
  category(@Args() categoryInput: CategoryInput): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }

  // computed field
  @ResolveField((type) => Number)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }
}
