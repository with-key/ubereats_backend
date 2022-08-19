import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailInput } from './dtos/verify-eamil.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationService: Repository<Verification>,
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
      const user = await this.userRepository.save(
        this.userRepository.create({
          email,
          password,
          role,
        }),
      );

      await this.verificationService.save(
        this.verificationService.create({
          user,
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
        select: ['password', 'id'],
      });

      console.log('user', user);

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

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }
  /**
   * @BeforeUpdate()를 사용했음에도 비밀번호 변경 시, 해쉬가 되지 않는 이유
   * entity를 거치지 않고 db에 바로 query를 보내기 때문이다. 그래서 빠르지만, @BeforeUpdate()가 패스된다.
   * 그래서 이것을 해결하기 위해 update가 아니라 save를 사용한다.
   */
  async editProfile(userId: number, { email, password }: EditProfileInput) {
    // return this.userRepository.update(userId, { ...editProfileInput });
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (email) {
      user.email = email;
      user.verified = false;
      await this.verificationService.save(
        this.verificationService.create({
          user,
        }),
      );
    }

    if (password) {
      user.password = password;
    }

    return this.userRepository.save(user);
  }

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verificationService.findOne({
        where: {
          code,
        },
        relations: ['user'],
      });

      if (verification) {
        verification.user.verified = true;
        this.userRepository.save(verification.user);

        return true;
      } else {
        throw new Error();
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
