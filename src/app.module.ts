import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'; // >= v10 설정
import { StoreModule } from './store/store.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

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
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // code first 방식으로 설정
      autoSchemaFile: true, // 설정은 사용하되, 파일 생성은 하지 않음
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      logging: true, // db에서 일어나는 일을 터미널에 표시 여부
    }),
    StoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

/**
 * Code First VS Schema First 설정
 * Schema First: 타입스크립트와 GQL 스키마를 따로따로 만들어줘야 한다.
 * Code First: 타입스크립트로 GQL을 만들어서 사용한다.
 */
