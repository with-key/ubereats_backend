import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    console.log(createRestaurantInput);

    const restaurant = this.restaurantRepository.create(createRestaurantInput);
    restaurant.owner = owner;

    // 유저가 입력한 값을 slug화 하여 고유값으로 찾기
    // 모든 공백 및 소문자로 치환
    const categoryName = createRestaurantInput.categoryName
      .trim()
      .toLowerCase();
    // 문자 내 공백 - 으로 치환
    const categorySlug = categoryName.replace(/ /g, '-');

    // category 테이블에서 slug 찾기
    let category = await this.categoryRepository.findOne({
      where: {
        slug: categorySlug,
      },
    });

    // // 만약 생성되어있는 slug가 없으면 새로 생성 및 저장하고 category 변수에 할당
    if (!category) {
      category = await this.categoryRepository.save(
        this.categoryRepository.create({
          name: categoryName,
          slug: categorySlug,
        }),
      );
    }

    // // 기존에 있던 또는 새로 생성된 category가 restaurant의 category로 저장
    restaurant.category = category;
    this.restaurantRepository.save(restaurant);
    return {
      ok: true,
    };
  }
}
