import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'; // >= v10 설정
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // code first 방식으로 설정
      autoSchemaFile: true, // 설정은 사용하되, 파일 생성은 하지 않음
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
