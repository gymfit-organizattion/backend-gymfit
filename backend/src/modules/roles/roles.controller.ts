import {
  Controller, Get, Post, Body, Param,
  Put, Delete, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRolDto, UpdateRolDto } from './dto/rol.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Public()
  @Post('seed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Inicializar roles del sistema',
    description: 'Inserta los 4 roles base (admin, entrenador, recepcionista, socio) solo si la tabla está vacía. Solo accesible por administradores.',
  })
  @ApiResponse({ status: 200, description: 'Roles inicializados o ya existentes' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente — solo admin' })
  seed() {
    return this.rolesService.seed();
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Listar todos los roles',
    description: 'Retorna todos los roles disponibles. Endpoint público — usado por el formulario de registro para cargar el selector de roles.',
  })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Datos del rol' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear rol (admin)' })
  @ApiResponse({ status: 201, description: 'Rol creado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  create(@Body() dto: CreateRolDto) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar rol (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Rol actualizado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRolDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar rol (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Rol eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
