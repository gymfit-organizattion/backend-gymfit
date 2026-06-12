import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
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
import { RutinasService } from './rutinas.service';
import { CreateRutinaDto, UpdateRutinaDto } from './dto/rutina.dto';
import { CreateAsignacionRutinaDto } from './dto/asignacion-rutina.dto';
import { RutinaEjercicioItemDto } from './dto/rutina-ejercicio.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Rutinas')
@ApiBearerAuth('JWT-auth')
@Controller('rutinas')
export class RutinasController {
  constructor(private readonly rutinasService: RutinasService) {}

  // ── CRUD RUTINAS ─────────────────────────────────────────────────────────

  @Post()
  @Roles('admin', 'entrenador')
  @ApiOperation({
    summary: 'Crear rutina (HU-09)',
    description: 'Crea una nueva rutina de ejercicios.',
  })
  @ApiResponse({ status: 201, description: 'Rutina creada' })
  create(@Body() dto: CreateRutinaDto) {
    return this.rutinasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las rutinas' })
  @ApiResponse({ status: 200, description: 'Lista de rutinas' })
  findAll() {
    return this.rutinasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rutina por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos de la rutina' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rutinasService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Actualizar rutina' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Rutina actualizada' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRutinaDto) {
    return this.rutinasService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar rutina (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Rutina eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rutinasService.remove(id);
  }

  // ── GESTIÓN DE EJERCICIOS DENTRO DE UNA RUTINA ───────────────────────────

  @Post(':id/ejercicios')
  @Roles('admin', 'entrenador')
  @ApiOperation({
    summary: 'Agregar ejercicio del catálogo a una rutina existente',
    description:
      'Agrega un ejercicio del catálogo a la rutina indicada con sus parámetros de carga.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la rutina' })
  @ApiResponse({ status: 201, description: 'Ejercicio agregado a la rutina' })
  @ApiResponse({ status: 404, description: 'Rutina o ejercicio no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'El ejercicio ya está en la rutina',
  })
  agregarEjercicio(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RutinaEjercicioItemDto,
  ) {
    return this.rutinasService.agregarEjercicioARutina(id, dto);
  }

  @Patch(':id/ejercicios/:reId')
  @Roles('admin', 'entrenador')
  @ApiOperation({
    summary: 'Actualizar parámetros de un ejercicio en la rutina',
    description:
      'Modifica series, repeticiones, descanso u observaciones de un ejercicio dentro de la rutina.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la rutina' })
  @ApiParam({
    name: 'reId',
    type: Number,
    description: 'ID del registro rutina_ejercicio',
  })
  @ApiResponse({ status: 200, description: 'Parámetros actualizados' })
  actualizarEjercicio(
    @Param('id', ParseIntPipe) id: number,
    @Param('reId', ParseIntPipe) reId: number,
    @Body() dto: Partial<RutinaEjercicioItemDto>,
  ) {
    return this.rutinasService.actualizarEjercicioDeRutina(id, reId, dto);
  }

  @Delete(':id/ejercicios/:reId')
  @Roles('admin', 'entrenador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Quitar ejercicio de una rutina',
    description: 'Elimina el registro rutina_ejercicio indicado.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la rutina' })
  @ApiParam({
    name: 'reId',
    type: Number,
    description: 'ID del registro rutina_ejercicio',
  })
  @ApiResponse({ status: 204, description: 'Ejercicio eliminado de la rutina' })
  quitarEjercicio(
    @Param('id', ParseIntPipe) id: number,
    @Param('reId', ParseIntPipe) reId: number,
  ) {
    return this.rutinasService.quitarEjercicioDeRutina(id, reId);
  }

  // ── ASIGNACIONES RUTINA → SOCIO ──────────────────────────────────────────

  @Post('asignaciones')
  @Roles('admin', 'entrenador')
  @ApiOperation({
    summary: 'Asignar rutina a socio (HU-10)',
    description: 'Vincula una rutina existente a un socio específico.',
  })
  @ApiResponse({ status: 201, description: 'Rutina asignada al socio' })
  @ApiResponse({ status: 404, description: 'Rutina o socio no encontrado' })
  asignarRutina(@Body() dto: CreateAsignacionRutinaDto) {
    return this.rutinasService.asignarRutina(dto);
  }

  @Get('asignaciones/socio/:idSocio')
  @Roles('admin', 'entrenador', 'recepcionista', 'socio')
  @ApiOperation({ summary: 'Rutinas asignadas a un socio' })
  @ApiParam({ name: 'idSocio', type: Number })
  @ApiResponse({ status: 200, description: 'Rutinas del socio' })
  findAsignacionesBySocio(@Param('idSocio', ParseIntPipe) idSocio: number) {
    return this.rutinasService.findAsignacionesBySocio(idSocio);
  }

  @Delete('asignaciones/:id')
  @Roles('admin', 'entrenador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar asignación de rutina' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la asignación' })
  @ApiResponse({ status: 204, description: 'Asignación eliminada' })
  removeAsignacion(@Param('id', ParseIntPipe) id: number) {
    return this.rutinasService.removeAsignacion(id);
  }
}
