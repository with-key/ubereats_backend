import { TakeOrderInput, TakeOrderOuput } from './dtos/take-order.dto';
import { UpdatesOrderInput } from './dtos/updates-oder.dto';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from './../common/common.constants';
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

  // 손님이 음식을 주문했을 때 시작되는 리스너
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

  // 음식조리가 완료됐을 때 발생하는 리스너
  @Subscription(() => Order)
  @Role(['Delivery']) // 확인하는 대상
  // 트리거는 오너가 발생시키고, 확인은 배달원이 한다.
  cookedOrder() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  // 주문의 상태가 변경되는 되는 것을 바라보는 리스너
  @Subscription(() => Order, {
    filter: (
      {
        orderUpdates: order,
      }: {
        orderUpdates: Order;
      },
      { input }: { input: UpdatesOrderInput },
      { user }: { user: User },
    ) => {
      //  API의 요청자(user.id)가 해당 주문의 오너, 배달원, 손님이 아니라면 (관련이 없으면)
      //  조회가 되지 않도록 처리
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      // 클라이언트에서 확인하고자 하는 값 (input.id)과 트리거가 발동된 (업데이트가 된)
      // 주문의 아이디가 같을 때만 업데이트
      return order.id === input.id;
    },
  })
  @Role(['Any'])
  // Args는 variable로 온다.
  orderUpdates(@Args('input') updatesOrderInput: UpdatesOrderInput) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }

  // 배달원이 주문을 수락했을 때
  @Mutation(() => TakeOrderOuput)
  @Role(['Delivery'])
  takeOver(
    @AuthUser() driver: User,
    @Args('input') takeOrderInput: TakeOrderInput,
  ): Promise<TakeOrderOuput> {
    return this.orders.takeOrder(driver, takeOrderInput);
  }
}
