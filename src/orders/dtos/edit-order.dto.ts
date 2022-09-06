import { Order } from 'src/orders/entities/order.entity';
import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';

@InputType()
export class EditOrderInput extends PickType(Order, ['id', 'orderStatus']) {}

@ObjectType()
export class EditOrderOutput extends CoreOutput {}
