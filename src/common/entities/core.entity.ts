import { Field } from '@nestjs/graphql';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * core : 모든 모듈에서 사용하는 id, createdAt, updatedAt 같은 COL들은 따로 빼서
 * 별도의 모듈로 관리하여 중복을 최소화 하고자 함
 *
 * 다른 Entity에서 항상 extends 된다.
 */

export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;
}
