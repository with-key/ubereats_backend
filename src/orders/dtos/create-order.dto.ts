import { OrderItemOption } from './../entities/order-item.entity';
import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';

// PickType을 사용하지 않고 `CreateOrderItemInput`따로 만들어서 불필요한 정보를 스키마에 표시하지 않는다.
@InputType()
class CreateOrderItemInput {
  @Field(() => Int)
  dishId: number;

  @Field(() => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  restaurantId: number;

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
