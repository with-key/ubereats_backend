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

  async createAccount({ email, role, password }: CreateAccountInput) {
    try {
      const found = await this.userRepository.findOne({
        where: {
          email,
        },
      });

      if (found) {
        // make Error
        return;
      }

      await this.userRepository.save(
        this.userRepository.create({
          email,
          password,
          role,
        }),
      );

      return true;
    } catch (error) {}
  }
}
