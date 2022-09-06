import { Order } from 'src/orders/entities/order.entity';
import { CoreOutput } from './../../common/dtos/core.dto';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { OrderStatus } from '../entities/order.entity';

@InputType()
export class GetOrdersInput {
  @Field(() => OrderStatus, { nullable: true })
  status: OrderStatus;
}

@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  @Field(() => [Order], { nullable: true })
  orders?: Order[];
}
