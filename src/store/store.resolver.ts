import { UpdateStoreDto } from './dtos/update-store.dto';
import { StoreService } from './store.service';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateStoreDto } from './dtos/create-store.dto';
import { Store } from './entities/store.entity';

@Resolver() // Resolver란 마치 로직이다.
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}
  // Store Entity를 넣음으로써 무엇이 달라지나?
  // myStore라는 요청에 대한 Response Type 이, Store entity 라는 것을 설정해주는 것이다.
  @Query(() => [Store])
  // 모든 store를 조회하는 API
  // 클라이언트에서는 요청 파라미터에 값을 넣어 보낼 수 있다.
  // 그리고 store[] 형식의 응답을 반환한다.
  getStore(): Promise<Store[]> {
    return this.storeService.getAll();
  }

  // Resolver안에서 Query, Mutation 요청이 생성된다.
  @Mutation(() => Boolean) // 해당 요청에 대한 응답 타입을 인자에 넣는다.
  async createStore(
    @Args('newStoreData') newStoreInfo: CreateStoreDto,
  ): Promise<boolean> {
    try {
      await this.storeService.createStore(newStoreInfo);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async updateStore(@Args() data: UpdateStoreDto): Promise<boolean> {
    try {
      await this.storeService.updateStore(data);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
