import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { EntrenadoresService } from './entrenadores.service';
import { CreateEntrenadorDto } from './dto/entrenador.dto';
import { UpdateEntrenadorDto } from './dto/update-entrenador.dto';
import { CreateAsignacionDto, BulkAsignacionDto } from './dto/asignacion.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Entrenadores')
@ApiBearerAuth('JWT-auth')
@Controller('entrenadores')
export class EntrenadoresController {
  constructor(private readonly entrenadoresService: EntrenadoresService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Registrar entrenador (admin)' })
  @ApiResponse({ status: 201, description: 'Entrenador registrado' })
  create(@Body() dto: CreateEntrenadorDto) { return this.entrenadoresService.create(dto); }

  @Get()
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Listar todos los entrenadores' })
  @ApiResponse({ status: 200, description: 'Lista de entrenadores' })
  findAll() { return this.entrenadoresService.findAll(); }

  @Get(':id')
  @Roles('admin', 'recepcionista', 'entrenador')
  @ApiOperation({ summary: 'Obtener entrenador por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos del entrenador' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.entrenadoresService.findOne(id); }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar entrenador (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Entrenador actualizado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEntrenadorDto) { return this.entrenadoresService.update(id, dto); }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar entrenador (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Entrenador eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.entrenadoresService.remove(id); }

  @Post('asignaciones')
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Asignar entrenador a socio', description: 'Crea la relación entrenador ↔ socio.' })
  @ApiResponse({ status: 201, description: 'Asignación creada' })
  asignar(@Body() dto: CreateAsignacionDto) { return this.entrenadoresService.asignar(dto); }

  @Post('asignaciones/masiva')
  @Roles('admin')
  @ApiOperation({ summary: 'Asignación masiva de entrenador a múltiples socios (HU-08)' })
  @ApiResponse({ status: 201, description: 'Asignaciones creadas' })
  asignacionMasiva(@Body() dto: BulkAsignacionDto) { return this.entrenadoresService.asignarMasivo(dto); }

  @Get(':id/asignaciones')
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Socios asignados a un entrenador' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del entrenador' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones' })
  asignacionesByEntrenador(@Param('id', ParseIntPipe) id: number) { return this.entrenadoresService.findAsignacionesByEntrenador(id); }

  @Delete('asignaciones/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar asignación entrenador-socio (admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la asignación' })
  @ApiResponse({ status: 204, description: 'Asignación eliminada' })
  removeAsignacion(@Param('id', ParseIntPipe) id: number) { return this.entrenadoresService.removeAsignacion(id); }
}
