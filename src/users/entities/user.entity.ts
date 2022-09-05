import { Order } from './../../orders/entities/order.entity';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsString } from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

export enum UserRole {
  Owner = 'Owner',
  Client = 'Client',
  Delivery = 'Delivery',
}

/**
 * enum을 사용하고자 할 때는 registerEnumType 를 통해서 register를 해줘야한다.
 */
registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(() => String) // graphQL type
  id: number;

  @Column()
  @Field(() => String)
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  role: UserRole;

  @Column({ select: false }) // select를 false로 하면, user를 조회할 때 정보가 제외된다
  @Field(() => String)
  @IsString()
  password: string;

  @Column({ default: false })
  @Field(() => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.driver)
  rides: Order[];
  /**
   * user의 entity를 저장하기전에 password를 hash 한다.
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        console.log(error);
      }
    }
  }

  /**
   * 비밀번호 체크
   */
  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(aPassword, this.password);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
