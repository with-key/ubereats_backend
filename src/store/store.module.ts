import { CreateStoreDto } from './dtos/create-store.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { StoreResolver } from './store.resolver';
import { Store } from './entities/store.entity';
import { StoreService } from './store.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store])], // Repository를 사용하기 위한 설정
  providers: [StoreResolver, StoreService], // Service를 사용하고자 할 때는 provider에 등록해야 한다.
})
export class StoreModule {}
