import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
