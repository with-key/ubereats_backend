import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Entity는 데이터베이스에 저장되는 데이터의 형태를 보여주는 모델과 비슷한 것이다.
// Entity is a class that maps to a database table (or collection when using MongoDB)

// client 에서 myStore라는 요청을 GET req 했을 때 Store라는 Object를 res하고
// 그 안에는 여러개의 Key (field) 가 있는데, 그 field의 타입이 string 이다.

// Store Object의 타입
@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Store {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(() => Boolean, { defaultValue: true }) // GQL에서 deault value가 있음을 설정
  @Column({ default: true }) // DB에서의 default Value가 있음을 설정
  @IsOptional() // DTO validation에서 Client에서 값을 필수로 보내지 않아도 되도록 설정해 줌
  @IsBoolean() // DTO validation에서 해당 값이 Boolean임을 검증
  isVegan: boolean; // TypeScript에서 해당 값의 형태가 Boolean임을 확인

  @Field(() => String, {
    defaultValue: '강남',
  })
  @Column()
  @IsString()
  address: string;

  @Field(() => String)
  @Column()
  @IsString()
  ownerName: string;

  @Field(() => String)
  @Column()
  @IsString()
  categoryName: string;
}

/**
 * @ObjectType은 자동으로 스키마를 빌드하기 위한 GraphQL decorator이다. code first 설정을 통해 gql 파일이 생성된다. (@nestjs/graphql)
 * @Entity는 TypeORM이 이 구조대로 DB에 저장하게 해준다. (typeORM)
 * @IuputType은 DTO를 생성하기 위해 넣어준 데코레이터이다. IuputType로 인해서 스키마 빌드가 동시에 되는데 그것을 막기 위해 isAbstract를 true로 설정했다.
 */
