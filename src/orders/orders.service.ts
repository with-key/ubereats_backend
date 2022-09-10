import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
} from './../common/common.constants';
import { PubSub } from 'graphql-subscriptions';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { NEW_PENDING_ORDER, PUB_SUB } from 'src/common/common.constants';
import { TakeOrderInput, TakeOrderOuput } from './dtos/take-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: {
          id: createOrderInput.restaurantId,
        },
      });

      // 등록된 레스토랑 확인
      if (!restaurant) {
        return {
          ok: false,
          error: '존재하지 않는 레스토랑입니다.',
        };
      }

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of createOrderInput.items) {
        // 레스토랑에 등록되어있는 매뉴 정보 조회
        const dish = await this.dishes.findOne({
          where: {
            id: item.dishId,
          },
        });

        // 레스토랑에 매뉴가 존재하는지 확인
        if (!dish) {
          return {
            ok: false,
            error: '존재하지 않는 매뉴입니다.',
          };
        }

        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          //  유저가 선택한 옵션이 dish 옵션에 있는지 확인
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );

          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice = dishFinalPrice + dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.name,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
                }
              }
            }
          }
        }

        orderFinalPrice = orderFinalPrice + dishFinalPrice;

        // 유저가 입력한 각 매뉴들의 옵션을 등록하여 order를 등록한다.
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }

      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '주문 등록이 실패했습니다.',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    console.log(status);
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user,
            // status가 falsy이면, 아무것도 없도록
            ...(status && { orderStatus: status }),
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { orderStatus: status }),
          },
        });
      } else if (user.role === UserRole.Owner) {
        // user가 여러개의 레스토랑을 가질 수 있기 때문에 아래와 같은 처리가 필요하다.
        // user가 owner인 레스토랑을 모두 찾고
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });

        orders = restaurants
          .map((restaurant) => {
            return restaurant.orders;
          })
          .flat(1);

        if (status) {
          orders = orders.filter((order) => order.orderStatus === status);
        }
      }

      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: '주문내역을 불러올 수 없습니다.',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: {
          id: orderId,
        },
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: '주문이 존재하지 않습니다.',
        };
      }

      // 조회 권한
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: '권한이 없습니다.',
        };
      }

      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: '주문내역을 조회할 수 없습니다.',
      };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, orderStatus }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    // 주문 존재 확인
    const order = await this.orders.findOne(orderId, {
      relations: ['restaurant'],
    });

    if (!order) {
      return {
        ok: false,
        error: '주문을 찾을 수 없습니다.',
      };
    }
    // 주문 조회 권한 여부 확인
    if (!this.canSeeOrder(user, order)) {
      return {
        ok: false,
        error: '조회 권한이 없습니다.',
      };
    }

    // 주문 수정 권한 여부 확인
    let canEdit = true;
    // Client는 수정권한이 없음
    if (user.role === UserRole.Client) {
      canEdit = false;
    }

    // 배달월이라면,
    if (user.role === UserRole.Delivery) {
      // 픽업상태, 배달완료된 상태가 모두 아니면 수정할 수 없다.
      if (
        orderStatus !== OrderStatus.PickedUp &&
        orderStatus !== OrderStatus.Deliverd
      ) {
        canEdit = false;
      }
    }

    // 오너라면,
    if (user.role === UserRole.Owner) {
      // 요리중, 요리 완료상태가 아니라면 수정할 수 없다.
      if (
        orderStatus !== OrderStatus.Cooked &&
        orderStatus !== OrderStatus.Cooking
      ) {
        canEdit = false;
      }
    }

    if (!canEdit) {
      return {
        ok: false,
        error: '수정할 수 없는 상태입니다.',
      };
    }

    // save는 create가 되었다면 전체 Entity 불러 오지만,
    // save만 있으면 수정된 값만 보이게 된다.
    await this.orders.save({
      id: order.id,
      orderStatus,
    });

    // 오더 상태가 변경된 오더
    const newOrder = { ...order, orderStatus };
    // Subscription Trigger 발생 1 -> 오너의 액션에 따라 배달원에게 조리 완료 알림을 알려줌
    if (user.role === UserRole.Owner) {
      // 조리상태가 완료된 상태되었다고 클라이언트에서 요청이 들어왔을 때
      if (orderStatus === OrderStatus.Cooked) {
        await this.pubSub.publish(NEW_COOKED_ORDER, {
          cookedOrder: newOrder,
        });
      }
    }

    // Subscription Trigger 발생 2 -> 주문 상태 변경 사실을 모두에게 알려줌
    await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });
    return {
      ok: true,
    };
  }

  async takeOrder(
    driver: User,
    takeOrderInput: TakeOrderInput,
  ): Promise<TakeOrderOuput> {
    try {
      const order = await this.orders.findOne({
        where: {
          id: takeOrderInput.id,
        },
      });

      if (!order) {
        return {
          ok: false,
          error: '주문이 존재하지 않습니다.',
        };
      }

      if (order.driver) {
        return {
          ok: false,
          error: '이미 배달원이 등록된 주문입니다.',
        };
      }

      // 생성되어있던 주문내역에 배달원을 추가한다.
      await this.orders.save({
        id: order.id,
        driver,
      });

      // 배달원이 추가됐음을 오너, 배달원, 손님에게 모두 알린다.
      await this.pubSub.publish(NEW_ORDER_UPDATE, { ...order, driver });

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '배달원 등록이 실패했습니다.',
      };
    }
  }
}
