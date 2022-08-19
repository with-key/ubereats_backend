import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@ObjectType()
@InputType({ isAbstract: true })
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // entity에 code를 생성하는 함수를 만든 이유는 다른 곳에서도 verification을 생성할수 있도록 하기 위해서
  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4().replace('-', '');
  }
}
