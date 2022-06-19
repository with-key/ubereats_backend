import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateStoreDto } from './dtos/create-store.dto';
import { Store } from './entities/store.entity';

@Resolver() // Resolver란 마치 로직이다.
export class StoreResolver {
  // Store Entity를 넣음으로써 무엇이 달라지나?
  // myStore라는 요청에 대한 Response Type 이, Store entity 라는 것을 설정해주는 것이다.
  @Query(() => [Store])
  // 모든 store를 조회하는 API
  // 클라이언트에서는 요청 파라미터에 값을 넣어 보낼 수 있다.
  // 그리고 store[] 형식의 응답을 반환한다.
  getStore(@Args('isVegan') isVegan: boolean): Store[] {
    console.log(isVegan);
    return [];
  }

  // Resolver안에서 Query, Mutation 요청이 생성된다.
  @Mutation(() => Boolean) // 해당 요청에 대한 응답 타입을 인자에 넣는다.
  createStore(@Args() newStoreInfo: CreateStoreDto): boolean {
    console.log(newStoreInfo);
    return true;
  }
}

/**
 * InputType : Qeury나 Mutation에서 Args의 타입을 설정할 때 Entity에서 설정한 것을 넣어줘야 하는데
 * 이때 코드 중복이 발생하고, 하드 코딩으로 해야 하기때문에 휴먼 에러가 있을 수 있음. 이것을 보완하기 위한
 * 유틸리티 데코레이터이다. Object를 통째로 전달해준다.
 * 예를 들면,
 * 서버 : @Args('newStoreInfo) newStoreInfo: CreateStoreDto,
 * 클라 : createStore(storeInfomation)
 *
 * ArgsType: 분리된 값을 GQL에 전달할 때 사용한다.
 * 예를 들면,
 * 서버 : @Args() newStoreInfo: CreateStoreDto,
 * 클라 
 *  mutation {
   createStore(newStoreInfo : {
    name: "",
    isVegan : true,
    address: "",
    ownerName:""
  })
}
 * 
 */
