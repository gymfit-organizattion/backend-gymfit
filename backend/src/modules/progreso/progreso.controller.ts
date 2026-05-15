import {
  Controller, Get, Post, Body, Param,
  Put, Delete, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProgresoService } from './progreso.service';
import { CreateProgresoDto, UpdateProgresoDto } from './dto/progreso.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Progreso')
@ApiBearerAuth('JWT-auth')
@Controller('progreso')
export class ProgresoController {
  constructor(private readonly progresoService: ProgresoService) {}

  @Post()
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Registrar progreso (HU-14)', description: 'Registra un nuevo hito de progreso físico para un socio.' })
  @ApiResponse({ status: 201, description: 'Progreso registrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body() dto: CreateProgresoDto) { return this.progresoService.create(dto); }

  @Get()
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Listar todos los registros de progreso' })
  @ApiResponse({ status: 200, description: 'Lista de progresos' })
  findAll() { return this.progresoService.findAll(); }

  @Get(':id')
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Obtener progreso por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos del progreso' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.progresoService.findOne(id); }

  @Get('socio/:idSocio')
  @Roles('admin', 'entrenador', 'recepcionista')
  @ApiOperation({ summary: 'Historial de progreso de un socio (HU-14)', description: 'Retorna todos los registros de progreso de un socio ordenados por fecha.' })
  @ApiParam({ name: 'idSocio', type: Number, description: 'ID del socio' })
  @ApiResponse({ status: 200, description: 'Historial de progreso del socio' })
  findBySocio(@Param('idSocio', ParseIntPipe) idSocio: number) { return this.progresoService.findBySocio(idSocio); }

  @Get('socio/:idSocio/comparativa')
  @Roles('admin', 'entrenador', 'socio')
  @ApiOperation({ summary: 'Historial comparativo con evaluación inicial (HU-10)' })
  @ApiParam({ name: 'idSocio', type: Number })
  @ApiResponse({ status: 200, description: 'Datos comparativos para gráficas' })
  getComparativa(@Param('idSocio', ParseIntPipe) idSocio: number) { 
    return this.progresoService.getComparativa(idSocio); 
  }

  @Put(':id')
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Actualizar registro de progreso' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Progreso actualizado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProgresoDto) { return this.progresoService.update(id, dto); }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar registro de progreso (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Registro eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.progresoService.remove(id); }
}
