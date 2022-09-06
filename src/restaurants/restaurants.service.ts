import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AllCategoriesOutput } from './dto/all-category.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dto/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly categoryRepository: CategoryRepository, // 커스텀 레포짓토리
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    console.log(createRestaurantInput);
    const restaurant = this.restaurantRepository.create(createRestaurantInput);
    restaurant.owner = owner;

    // 카테고리 유무에 따라 생성 또는 조회하기
    const category = await this.categoryRepository.getOrCreate(
      createRestaurantInput.categoryName,
    );

    // 기존에 있던 또는 새로 생성된 category가 restaurant의 category로 저장
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

      let category: Category = null;
      // categoryName이 있다면, 사용자가 수정하고자 하는 의도로 판단
      if (editRestaurantInput.categoryName) {
        // 카테고리가 있다면 조회, 없다면 생성하고 기존에 선언했던 변수에 할당
        category = await this.categoryRepository.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      // 카테고리를 생성 또는 조회했다면, 새로운 값으로 레스토랑 정보를 수정
      // 'save'는 기존에 정보가 있다면 수정, 없다면 새롭게 저장
      await this.restaurantRepository.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          // 카테고리는 nullable 이기때문에 있을수도, 없을수도 있다.
          ...(category && { category }),
        },
      ]);

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

  async deleteRestaurant(
    owner: User,
    deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    // valid 1. 존재하는 레스토랑인지 확인
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: {
          id: deleteRestaurantInput.restaurantId,
        },
      });

      // valid 2. 레스토랑의 오너가 맞는지 확인

      if (!restaurant) {
        return {
          ok: false,
          error: '존재하지 않는 레스토랑입니다',
        };
      }

      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '레스토랑의 소유주가 아닙니다.',
        };
      }

      // 존재 하는 레스토랑이라면 삭제
      await this.restaurantRepository.delete(
        deleteRestaurantInput.restaurantId,
      );

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

  async getAllCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categoryRepository.find();
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  countRestaurants(category: Category) {
    return this.restaurantRepository.count({});
  }

  async findCategoryBySlug(
    categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    try {
      const category = await this.categoryRepository.findOne({
        where: {
          slug: categoryInput.slug,
        },
      });

      if (!category) {
        return {
          ok: false,
          error: '존재하지 않는 카테고리 입니다.',
        };
      }

      return {
        ok: true,
        category,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
