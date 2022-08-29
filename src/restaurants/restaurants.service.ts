import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    const restaurant = this.restaurantRepository.create(createRestaurantInput);
    restaurant.owner = owner;

    // 카테고리 유무에 따라 생성 또는 조회하기
    const category = await this.categoryRepository.getOrCreate(
      createRestaurantInput.categoryName,
    );

    // // 기존에 있던 또는 새로 생성된 category가 restaurant의 category로 저장
    restaurant.category = category;
    this.restaurantRepository.save(restaurant);
    return {
      ok: true,
    };
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    // on
    // 클라이언트에서 요청을 보낸 것이 존재하는 레스토랑인지 확인
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: {
          id: editRestaurantInput.restaurantId,
        },
      });
      // findOneOrFail을 사용하지 않고 직접 exception handling을 구현
      if (!restaurant) {
        return {
          ok: false,
          error: '존재하지 않는 레스토랑 입니다',
        };
      }

      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '소유주만 가게 정보를 수정할 수 있습니다',
        };
      }

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
