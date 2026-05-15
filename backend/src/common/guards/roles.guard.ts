import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard de roles — verifica que el usuario autenticado tenga
 * al menos uno de los roles requeridos en el endpoint.
 * Uso: @UseGuards(JwtAuthGuard, RolesGuard) + @Roles('admin')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si el endpoint no tiene @Roles(), cualquier usuario autenticado puede acceder
    if (!rolesRequeridos || rolesRequeridos.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    const rolUsuario: string = (user?.rol?.nombre ?? '').toLowerCase();
    const rolesRequeridosLower = rolesRequeridos.map(r => r.toLowerCase());

    console.log(`[RolesGuard] Endpoint: ${context.getHandler().name}`);
    console.log(`[RolesGuard] Requeridos: ${rolesRequeridosLower}`);
    console.log(`[RolesGuard] Usuario Rol: ${rolUsuario}`);
    console.log(`[RolesGuard] User ID: ${user?.id_usuario}`);

    return rolesRequeridosLower.includes(rolUsuario);
  }
}
