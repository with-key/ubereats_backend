import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';

// SetMetadata는 resolver 사용할 수 있는 여분의 데이터를 제공하는 데코레이터를 반환하는 함수이다.
// Role은 SetMetadata를 반환하는 함수이다.
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
