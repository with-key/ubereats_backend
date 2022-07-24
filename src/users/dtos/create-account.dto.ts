import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/core.dto';
import { User } from '../entities/user.entity';

// create account API Request DTO
@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

// create account API Response
@ObjectType()
export class CreateAccountOutput extends MutationOutput {}
