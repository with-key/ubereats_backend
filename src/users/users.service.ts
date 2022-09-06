import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UseProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-eamil.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    role,
    password,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      // 중복 이메일 확인
      const exists = await this.userRepository.findOne({
        where: {
          email,
        },
      });

      if (exists) {
        return {
          ok: false,
          error: '이미 존재하는 아이디 입니다.',
        };
      }

      // 새로운 계정 생성
      const user = await this.userRepository.save(
        this.userRepository.create({
          email,
          password,
          role,
        }),
      );

      // 새로운 verification 생성
      await this.verificationRepository.save(
        this.verificationRepository.create({
          user,
        }),
      );

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '새로운 계정을 생성할 수 없습니다.',
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      // 유저 존재 여부 확인
      const user = await this.userRepository.findOne({
        where: {
          email,
        },
        select: ['password', 'id'],
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

      // 토큰 생성
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: '토큰 생성을 실패했습니다.',
      };
    }
  }

  async findById(id: number): Promise<UseProfileOutput> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
        },
      });
      if (!user) {
        return {
          ok: false,
          error: '유저를 찾을 수 없습니다.',
        };
      }
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  /**
   * @BeforeUpdate()를 사용했음에도 비밀번호 변경 시, 해쉬가 되지 않는 이유
   * entity를 거치지 않고 db에 바로 query를 보내기 때문이다. 그래서 빠르지만, @BeforeUpdate()가 패스된다.
   * 그래서 이것을 해결하기 위해 update가 아니라 save를 사용한다.
   */
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      // 사용자 조회
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      // 이메일을 변경한다면,
      if (email) {
        user.email = email;
        user.verified = false;

        await this.verificationRepository.save(
          this.verificationRepository.create({
            user,
          }),
        );
      }

      // 패스워드를 변경한다면,
      if (password) {
        user.password = password;
      }

      this.userRepository.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verificationRepository.findOne({
        where: {
          code,
        },
        relations: ['user'],
      });

      if (verification) {
        verification.user.verified = true;
        this.userRepository.save(verification.user);
        this.verificationRepository.delete(verification.id); // 인증이 종료되면 삭제된다.
        return {
          ok: true,
        };
      } else {
        throw new Error();
      }
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
