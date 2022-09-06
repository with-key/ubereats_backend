import { OrderItem } from './orders/entities/order-item.entity';
import { Dish } from './restaurants/entities/dish.entity';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'; // >= v10 설정
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { Context } from 'graphql-ws';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.end.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod', // 배포 상태에서는 사용하지 않음
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        SECRET_KEY: Joi.string().required(),
        // MAILGUN_API_KEY: Joi.string().required(),
        // MAILGUN_DOMAIN_NAME: Joi.string().required(),
        // MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams) => {
            const TOKEN_KEY = 'x-jwt';
            const authToken = connectionParams[TOKEN_KEY];
            if (!authToken) {
              throw new Error('토큰이 없습니다.');
            }
            // ws로 요청 시 guard의 context에 값을 전송한다.
            return { token: authToken };
          },
        },
      },
      // http로 요청 시 guard의 context에 값을 전송한다.
      context: ({ req }) => {
        const TOKEN_KEY = 'x-jwt';
        return { token: req.headers[TOKEN_KEY] };
      },
      autoSchemaFile: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true, // 이 설정으로 Entity와 DB를 항상 일치시켜준다. (저장과 동시에)
      logging: true, // db에서 일어나는 일을 터미널에 표시 여부
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
      ],
    }),
    JwtModule.forRoot({
      privateKey: process.env.SECRET_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    UsersModule,
    AuthModule,
    RestaurantsModule,
    OrdersModule,
  ],
})
export class AppModule {}
