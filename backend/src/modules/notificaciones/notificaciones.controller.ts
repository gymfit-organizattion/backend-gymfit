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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import {
  CreateNotificacionDto,
  UpdateNotificacionDto,
  MarcarLeidaDto,
} from './dto/notificacion.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Notificaciones')
@ApiBearerAuth('JWT-auth')
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({
    summary: 'Crear notificación manual (admin)',
    description: 'Crea una notificación manual para uno o varios usuarios.',
  })
  @ApiResponse({ status: 201, description: 'Notificación creada' })
  create(@Body() dto: CreateNotificacionDto) {
    return this.notificacionesService.create(dto);
  }

  @Get()
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Listar notificaciones',
    description:
      'Lista todas las notificaciones. Filtra por usuario con el query param id_usuario.',
  })
  @ApiQuery({
    name: 'id_usuario',
    required: false,
    type: Number,
    description: 'Filtrar por ID de usuario',
  })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  findAll(
    @Query('id_usuario', new ParseIntPipe({ optional: true }))
    id_usuario?: number,
  ) {
    return this.notificacionesService.findAll(id_usuario);
  }

  @Get('estadisticas')
  @Roles('admin')
  @ApiOperation({
    summary: 'Estadísticas de notificaciones (admin)',
    description: 'Resumen de notificaciones leídas, no leídas y por tipo.',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas de notificaciones' })
  estadisticas() {
    return this.notificacionesService.obtenerEstadisticas();
  }

  @Post('generar-automaticas')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Generar todas las notificaciones automáticas',
    description:
      'Genera notificaciones de membresías por vencer y stock bajo en un solo llamado.',
  })
  @ApiResponse({ status: 201, description: 'Notificaciones generadas' })
  generarAutomaticas() {
    return this.notificacionesService.generarTodasAutomaticas();
  }

  @Post('generar/membresias')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Generar notificaciones de membresías por vencer',
    description:
      'Genera notificaciones para socios cuya membresía vence en N días.',
  })
  @ApiQuery({
    name: 'dias',
    required: false,
    type: Number,
    example: 5,
    description: 'Días de anticipación (default: 5)',
  })
  @ApiResponse({
    status: 201,
    description: 'Notificaciones de membresías generadas',
  })
  generarMembresias(
    @Query('dias', new ParseIntPipe({ optional: true })) dias?: number,
  ) {
    return this.notificacionesService.generarNotificacionesMembresias(
      dias ?? 5,
    );
  }

  @Post('generar/stock-bajo')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Generar notificaciones de stock bajo',
    description:
      'Genera notificaciones para equipos cuyo stock está por debajo del mínimo.',
  })
  @ApiResponse({
    status: 201,
    description: 'Notificaciones de stock generadas',
  })
  generarStockBajo() {
    return this.notificacionesService.generarNotificacionesStockBajo();
  }

  @Get('no-leidas/:id_usuario')
  @Roles('admin', 'recepcionista', 'entrenador', 'socio')
  @ApiOperation({ summary: 'Contador de notificaciones no leídas' })
  @ApiParam({ name: 'id_usuario', type: Number, description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Número de notificaciones no leídas',
  })
  contarNoLeidas(@Param('id_usuario', ParseIntPipe) id_usuario: number) {
    return this.notificacionesService.contarNoLeidas(id_usuario);
  }

  @Post('marcar-leidas/:id_usuario')
  @Roles('admin', 'recepcionista', 'entrenador', 'socio')
  @ApiOperation({
    summary: 'Marcar notificaciones como leídas',
    description:
      'Marca una o todas las notificaciones de un usuario como leídas.',
  })
  @ApiParam({ name: 'id_usuario', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones marcadas como leídas',
  })
  marcarLeidas(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Body() dto: MarcarLeidaDto,
  ) {
    return this.notificacionesService.marcarLeidas(id_usuario, dto);
  }

  @Get(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Obtener notificación por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos de la notificación' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionesService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar notificación (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Notificación actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNotificacionDto,
  ) {
    return this.notificacionesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar notificación (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Notificación eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionesService.remove(id);
  }
}
