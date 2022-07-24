import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createAccount({
    email,
    role,
    password,
  }: CreateAccountInput): Promise<string | undefined> {
    try {
      const exists = await this.userRepository.findOne({
        where: {
          email,
        },
      });

      // email이 이미 등록된 것이라면, if문에서 걸림
      if (exists) {
        return '이미 존재하는 아이디 입니다.';
      }

      // save: db에 저장, create: db에 저장할 아이템을 생성
      // create 전에 @BeforeInsert 에 의해서 비밀번호가 hash된다.
      await this.userRepository.save(
        this.userRepository.create({
          email,
          password,
          role,
        }),
      );
    } catch (error) {
      return '계정을 생성할 수 없음';
    }
  }
}
