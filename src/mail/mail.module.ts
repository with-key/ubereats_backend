import { DynamicModule, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
})
export class MailModule {
  static forRoot(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      exports: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options, // app module에서 받은 값을 provider로 등록
        },
        MailService,
      ],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        MailService,
      ],
    };
  }
}
