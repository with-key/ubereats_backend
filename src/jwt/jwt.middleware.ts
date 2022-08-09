import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt.service';
import { UserService } from '../users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        try {
          const user = await this.userService.findById(decoded['id']);
          req['user'] = user; // request 안에 user 라는 property를 새롭게 만들어 준 것
        } catch (e) {
          console.log(e);
        }
      }
    }

    // 동작이 끝나면 next()가 실행되도록 구현
    next();
  }
}

// 클래스가 아닌 function 자체를 등록해서 미들웨어를 구현할 수 있다.
