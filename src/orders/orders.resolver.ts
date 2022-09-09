import { NEW_PENDING_ORDER, PUB_SUB } from './../common/common.constants';
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
import { Inject } from '@nestjs/common';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly orders: OrdersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

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

  // Error: canant return null -> Order를 반환한다고 했는데, publish에서 order가 아닌 다른 값을 반환하고 있기 때문에
  // resolve에서 반환되는 값을 변형시켠준다.
  @Subscription(() => Order, {
    // payload는 트리거를 발생시키는 함수에서 보낸다.
    // filter는 반드시 불리언값을 return 해야한다.
    filter: ({ pendingOrders }, _, { user }) => {
      return pendingOrders.ownerId === user.id;
    },
    resolve: ({ pendingOrders }) => pendingOrders.order,
  })
  @Role(['Client'])
  pendingOrders() {
    // 트리거가 들어가야 한다. NEW_PENDING_ORDER
    // 트리거는 NEW_PENDING_ORDERf를 퍼블리쉬 하고 있는 함수가 실행되면 발생한다.
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }
}
