import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from './jwt.contants';
import { JwtModuleOptions } from './jwt.interfaces';

@Module({})
@Global()
export class JwtModule {
  // 동적모듈을 만들기 위한 설정 시작 -> 클래스.forRoot 로 사용되기 때문에 static method를 만든다.
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule, // 모듈의 이름 설정
      // 해당 모듈에서 제공하는 provider를 다른 모듈에서 사용할 수 있게 합니다.
      exports: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
      ],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
      ],
    };
  }
}

/**
 * 해당 모듈에서 사용하는 provider를 가지고 있는 모듈을 정의합니다.
 * (사용하기 위한 provider가 있을 경우, 해당 provider를 가지고 있는 모듈에서 export 해줘야 합니다.)
 */
