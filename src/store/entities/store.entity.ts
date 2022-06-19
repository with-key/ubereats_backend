import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Entity는 데이터베이스에 저장되는 데이터의 형태를 보여주는 모델과 비슷한 것이다.
// Entity is a class that maps to a database table (or collection when using MongoDB)

// client 에서 myStore라는 요청을 GET req 했을 때 Store라는 Object를 res하고
// 그 안에는 여러개의 Key (field) 가 있는데, 그 field의 타입이 string 이다.

// Store Object의 타입
@ObjectType() // === GraphQL에서 말하는 Entity와 무척 유사하다. 그래서 이 파일명도 Entity라고 명명함
@Entity()
export class Store {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => Boolean)
  @Column()
  isVegan: boolean;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => String)
  @Column()
  ownerName: string;

  @Field(() => String)
  @Column()
  categoryName: string;
}

/**
 * @ObjectType은 자동으로 스키마를 빌드하기 위한 GraphQL decorator이다. code first 설정을 통해 gql 파일이 생성된다. (@nestjs/graphql)
 * @Entity는 TypeORM이 이 구조대로 DB에 저장하게 해준다. (typeORM)
 */
