// DTO는 클라이언트로부터 받는 Args의 형식 모아둔 객체이다.

import { InputType, OmitType } from '@nestjs/graphql';
import { Store } from '../entities/store.entity';

// @ArgsType() : ArgsType를 이용해서 만든 DTO
// export class CreateStoreDto {
//   @Field(() => String)
//   @IsString()
//   @Length(5, 10)
//   name: string;

//   @Field(() => Boolean)
//   @IsBoolean()
//   isVegan: boolean;

//   @Field(() => String)
//   @IsString()
//   address: string;

//   @Field(() => String)
//   @IsString()
//   ownerName: string;
// }

// MapType을 사용해서 Entity에서 DTO를 만들기
@InputType()
export class CreateStoreDto extends OmitType(Store, ['id']) {
  //
}
