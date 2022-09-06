import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';

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

      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

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
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user,
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
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

        // console.log(restaurants);
        orders = restaurants
          .map((restaurant) => {
            return restaurant.orders;
          })
          .flat(1);
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
}