import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      // 유저 존재 여부 확인
      const user = await this.userRepository.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        return {
          ok: false,
          error: '등록되지 않은 아이디 입니다.',
        };
      }

      // 비밀번호 일치 확인
      const checkPassword = await user.checkPassword(password);
      if (!checkPassword) {
        return {
          ok: false,
          error: '비밀번호가 일치하지 않습니다.',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  findById(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }
}
