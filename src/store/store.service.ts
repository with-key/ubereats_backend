import { UpdateStoreDto } from './dtos/update-store.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CreateStoreDto } from './dtos/create-store.dto';
import { Store } from './entities/store.entity';

// Service는 중간의 로직을 가지고 있는 파일이다.
// DB와 상호작용하여, Resolver에게 그 결과를 전달한다.

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store) private readonly store: Repository<Store>, // Repository를 별도로 생성하지 않고, Entity를 변환해서 사용하였다.
  ) {}
  getAll(): Promise<Store[]> {
    return this.store.find();
  }

  createStore(createStoreDto: CreateStoreDto): Promise<Store> {
    const newStore = this.store.create(createStoreDto);
    return this.store.save(newStore);
  }

  // update는 Promise를 반환한다
  updateStore(updateStoreDto: UpdateStoreDto): Promise<UpdateResult> {
    return this.store.update(updateStoreDto.id, { ...updateStoreDto.data });
  }
}
