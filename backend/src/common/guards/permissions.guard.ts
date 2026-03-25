import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSION_KEY,
  RequiredPermission,
} from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as {
      role?: string;
      permissions?: Record<string, string[]>;
    } | undefined;

    if (!user) return false;

    if (user.role === 'SUPERADMIN') return true;

    const modulePerms = user.permissions?.[required.module];
    if (!modulePerms || !Array.isArray(modulePerms)) return false;

    return modulePerms.includes(required.action);
  }
}
