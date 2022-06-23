import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateStoreDto } from './create-store.dto';

@InputType()
export class UpdateInputType extends PartialType(CreateStoreDto) {}

/**
 * 수정할 때는 나머지 data는 모두 optional 해야하고, id는 required 해야 한다.
 * 그래서 Id만 별도의 Field로 생성하고, 나머지는 CreateStoreDto를 활용해서 Data Field를 생성했다.
 */

@ArgsType()
export class UpdateStoreDto {
  @Field((type) => Number)
  id: number;

  @Field((type) => UpdateInputType)
  data: UpdateInputType;
}
