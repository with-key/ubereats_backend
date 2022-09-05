import { CoreEntity } from './../../common/entities/core.entity';
import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';
import { Entity, ManyToOne } from 'typeorm';
import { Dish, DishChoice } from 'src/restaurants/entities/dish.entity';

// OrderItem > OrderItemOption

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(() => String)
  name: string;
  @Field(() => DishChoice, { nullable: true })
  choice?: DishChoice;
  @Field(() => Int, { nullable: true })
  extra?: number;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @ManyToOne(() => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field(() => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}
