import { Module } from '@nestjs/common';
import { StoreResolver } from './store.resolver';

@Module({
  providers: [StoreResolver],
})
export class StoreModule {}
