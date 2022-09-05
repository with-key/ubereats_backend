import { OrdersService } from './orders.service';
import { Order } from 'src/orders/entities/order.entity';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';

@Resolver((of) => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrdersService) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }
}
