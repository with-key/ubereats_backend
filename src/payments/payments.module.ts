import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PaymentsResolver } from './payments.resolver';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
  providers: [PaymentsResolver, PaymentsService],
})
export class PaymentsModule {}
