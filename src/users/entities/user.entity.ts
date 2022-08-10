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
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';

// type UserRole = 'client' | 'owner' | 'delivery';
enum UserRole {
  Owner,
  Client,
  Delivery,
}

/**
 * enum을 사용하고자 할 때는 registerEnumType 를 통해서 register를 해줘야한다.
 */
registerEnumType(UserRole, { name: 'UserRole' }); // ???

@InputType({ isAbstract: true })
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

  @Column()
  @Field(() => String)
  password: string;

  /**
   * user의 entity를 저장하기전에 password를 hash 한다.
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      throw new InternalServerErrorException('서버에러 발생');
    }
  }

  /**
   * 비밀번호 체크
   */
  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(aPassword, this.password);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
