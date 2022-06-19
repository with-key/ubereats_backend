import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';

// Service는 중간의 로직을 가지고 있는 파일이다.
// DB와 상호작용하여, Resolver에게 그 결과를 전달한다.

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store) private readonly store: Repository<Store>,
  ) {}
  getAll(): Promise<Store[]> {
    return this.store.find();
  }
}
