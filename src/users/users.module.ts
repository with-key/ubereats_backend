import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { UsersResolver } from './users.resolver';
import { ConfigService } from '@nestjs/config';
import { Verification } from './entities/verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification]), ConfigService],
  exports: [UserService],
  providers: [UserService, UsersResolver],
})
export class UsersModule {}
