import { Order } from './../../orders/entities/order.entity';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field(() => Int)
  @Column()
  transactionId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.paymenets, { onDelete: 'CASCADE' })
  user: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.payments, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @Field(() => String)
  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: string;
}
