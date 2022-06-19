// DTO는 클라이언트로부터 받는 Args의 형식 모아둔 객체이다.

import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

// Entity와 비슷해보이지만, 이 클래스는 클라이언트의 req Args의 타입으로 사용된다.
// @InputType()
// export class CreateStoreDto {
//   @Field(() => String)
//   name: string;

//   @Field(() => Boolean)
//   isVegan: boolean;

//   @Field(() => String)
//   address: string;

//   @Field(() => String)
//   ownerName: string;
// }

@ArgsType()
export class CreateStoreDto {
  @Field(() => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(() => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => String)
  @IsString()
  ownerName: string;
}
