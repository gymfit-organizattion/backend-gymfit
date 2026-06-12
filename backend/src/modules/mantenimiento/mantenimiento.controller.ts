import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MantenimientoService } from './mantenimiento.service';
import {
  CreateMantenimientoDto,
  UpdateMantenimientoDto,
} from './dto/mantenimiento.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Mantenimiento')
@ApiBearerAuth('JWT-auth')
@Controller('mantenimiento')
export class MantenimientoController {
  constructor(private readonly mantenimientoService: MantenimientoService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({
    summary: 'Registrar mantenimiento (HU-20)',
    description:
      'Registra una intervención de mantenimiento en un equipo del gimnasio.',
  })
  @ApiResponse({ status: 201, description: 'Mantenimiento registrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  create(@Body() dto: CreateMantenimientoDto) {
    return this.mantenimientoService.create(dto);
  }

  @Get()
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Listar todos los registros de mantenimiento' })
  @ApiResponse({ status: 200, description: 'Lista de mantenimientos' })
  findAll() {
    return this.mantenimientoService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Obtener mantenimiento por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos del mantenimiento' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mantenimientoService.findOne(id);
  }

  @Get('equipo/:idEquipo')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Historial de mantenimiento de un equipo (HU-20)',
    description:
      'Retorna todo el historial de intervenciones de un equipo específico.',
  })
  @ApiParam({ name: 'idEquipo', type: Number, description: 'ID del equipo' })
  @ApiResponse({ status: 200, description: 'Historial del equipo' })
  findByEquipo(@Param('idEquipo', ParseIntPipe) idEquipo: number) {
    return this.mantenimientoService.findByEquipo(idEquipo);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar registro de mantenimiento (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Mantenimiento actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMantenimientoDto,
  ) {
    return this.mantenimientoService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar registro de mantenimiento (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Registro eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mantenimientoService.remove(id);
  }
}
