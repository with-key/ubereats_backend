import { Field, ObjectType } from '@nestjs/graphql';

// Entity는 DB의 모델이다.
// client 에서 myStore라는 요청을 GET req 했을 때 Store라는 Object를 res하고
// 그 안에는 여러개의 Key (field) 가 있는데, 그 field의 타입이 string 이다.

// Store Object의 타입
@ObjectType()
export class Store {
  // field는 {} 안에서의 하나의 key
  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  isVegan: boolean;

  @Field(() => String)
  address: string;

  @Field(() => String)
  ownerName: string;
}
