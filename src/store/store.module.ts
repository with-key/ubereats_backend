import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { StoreResolver } from './store.resolver';
import { Store } from './entities/store.entity';
import { StoreService } from './store.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store])], // Store라는 Repository를 import 한다.
  providers: [StoreResolver, StoreService], // StoreService를 생성해서, import 한다.
})
export class StoreModule {}
