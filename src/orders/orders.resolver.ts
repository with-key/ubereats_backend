import { OrdersService } from './orders.service';
import { Order } from 'src/orders/entities/order.entity';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orders: OrdersService) {}

  // 주문 내역 생성하기
  @Mutation(() => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orders.createOrder(customer, createOrderInput);
  }

  // 로그인 한 대상자의 모든 주문내역 불러오기
  @Query(() => GetOrdersOutput)
  @Role(['Any'])
  getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orders.getOrders(user, getOrdersInput);
  }

  @Query(() => GetOrderOutput)
  @Role(['Any'])
  getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ) {
    return this.orders.getOrder(user, getOrderInput);
  }

  @Mutation(() => EditOrderOutput)
  @Role(['Any'])
  editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orders.editOrder(user, editOrderInput);
  }

  @Mutation(() => Boolean)
  potatoReady() {
    pubsub.publish('hotPotatos', { readyPotato: 'hello world!' });
    return true;
  }

  @Subscription(() => String)
  @Role(['Any'])
  readyPotato(@AuthUser() user: User) {
    // 트리거 : 우리를 기다리는 이벤트
    return pubsub.asyncIterator('hotPotatos');
  }
}
