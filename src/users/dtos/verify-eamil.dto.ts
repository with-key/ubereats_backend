import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';
import { Verification } from '../entities/verification.entity';

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {
  @Field(() => String)
  code: string;
}

@ObjectType()
export class VerifyEmailOutput extends CoreOutput {}
