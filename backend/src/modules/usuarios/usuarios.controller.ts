import {
  Controller, Get, Post, Body, Param,
  Put, Delete, ParseIntPipe, HttpCode, HttpStatus, Request, UseGuards
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Usuarios')
@ApiBearerAuth('JWT-auth')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear usuario (admin)', description: 'Crea un nuevo usuario del sistema. Solo accesible por administradores.' })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente' })
  @ApiResponse({ status: 409, description: 'Correo o identificación duplicados' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Get()
  @Roles('admin', 'recepcionista', 'entrenador')
  @ApiOperation({ summary: 'Listar todos los usuarios', description: 'Retorna todos los usuarios del sistema con su rol. Los passwords no se incluyen.' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  findAll(@Request() req: any) {
    console.log(`[UsuariosController] findAll called by user: ${req.user?.correo}, role: ${req.user?.rol?.nombre}`);
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener usuario por ID (admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Datos del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar usuario (admin)', description: 'Actualiza cualquier campo del usuario incluyendo rol y estado. Si se envía password se hashea automáticamente.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario a actualizar' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar usuario (admin)', description: 'Soft-delete: cambia estado a false. El usuario no puede iniciar sesión pero sus datos se conservan.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario a desactivar' })
  @ApiResponse({ status: 204, description: 'Usuario desactivado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
