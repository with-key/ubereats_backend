import { Payment } from 'src/payments/entities/payment.entity';
import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
  'transactionId',
  'restaurantId',
]) {}

@ObjectType()
export class CreatePaymentOuput extends CoreOutput {}
