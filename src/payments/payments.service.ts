import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOuput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,

    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    { restaurantId, transactionId }: CreatePaymentInput,
  ): Promise<CreatePaymentOuput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: {
          id: restaurantId,
        },
      });

      if (!restaurant) {
        return {
          ok: false,
          error: '레스토랑을 찾을 수 없습니다.',
        };
      }

      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '이 레스토랑의 소유주가 아닙니다.',
        };
      }

      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      );

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '결제 요청이 실패했습니다.',
      };
    }
  }

  async getPayments(owner): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({
        where: {
          user: owner,
        },
      });
      return {
        ok: true,
        payments,
      };
    } catch {
      return {
        ok: false,
        error: '거래 내역이 존재하지 않습니다.',
      };
    }
  }
}
