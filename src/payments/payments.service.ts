import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
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

      // 결제가 이루어지면,

      // 해당 레스토랑은 프로모션 대상이 되고,
      restaurant.isPromoted = true;

      // 프로모션 기간은 오늘로부터 +7일이 설정된다.
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promoteUntil = date;

      // 그리고 해당 정보가 레스토랑에 저장된다.
      this.restaurants.save(restaurant);

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

  async getPayments(owner: User): Promise<GetPaymentsOutput> {
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

  // 크론으로 설정 예정
  async checkPromotedRestaurants() {
    // orm을 통해서 기한이 만료된 레스토랑을 조회하고,
    const restaruants = await this.restaurants.find({
      where: {
        isPromoted: true,
        promoteUntil: LessThan(new Date()), // 현재 기준에서 날짜가 지난 것을 찾을 수 있음
      },
    });

    // 조회된 레스토랑들을 순회하면서 프로모션 옵션을 off하고 저장한다
    restaruants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promoteUntil = null;
      await this.restaurants.save(restaurant);
    });
  }
}
