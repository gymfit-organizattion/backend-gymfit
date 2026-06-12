import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
  ApiBody,
} from '@nestjs/swagger';
import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto, ValidarAccesoDto } from './dto/asistencia.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Asistencias')
@ApiBearerAuth('JWT-auth')
@Controller('asistencias')
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  @Post('validar-acceso')
  @Roles('admin', 'recepcionista')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar acceso al gimnasio (HU-16)',
    description:
      'Verifica la membresía del socio en tiempo real por su número de identificación. ' +
      'Retorna { acceso: true/false, color: "verde"/"rojo", motivo }. ' +
      'Si el acceso es válido, registra la asistencia automáticamente (HU-17).',
  })
  @ApiBody({ type: ValidarAccesoDto })
  @ApiResponse({
    status: 200,
    description: 'Resultado de validación con semáforo verde/rojo',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  validarAcceso(@Body() dto: ValidarAccesoDto) {
    return this.asistenciasService.validarAcceso(dto.identificacion);
  }

  @Post()
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Registrar asistencia manual (HU-17)',
    description:
      'Registra la asistencia de un socio por su id_socio directamente.',
  })
  @ApiResponse({ status: 201, description: 'Asistencia registrada' })
  registrar(@Body() dto: CreateAsistenciaDto) {
    return this.asistenciasService.registrar(dto);
  }

  @Get()
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Listar todas las asistencias' })
  @ApiResponse({ status: 200, description: 'Lista de asistencias' })
  findAll() {
    return this.asistenciasService.findAll();
  }

  @Get('hoy')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Asistencias del día',
    description:
      'Lista únicamente las asistencias registradas en el día actual.',
  })
  @ApiResponse({ status: 200, description: 'Asistencias de hoy' })
  findHoy() {
    return this.asistenciasService.findHoy();
  }

  @Get('socio/:idSocio')
  @Roles('admin', 'recepcionista', 'entrenador')
  @ApiOperation({ summary: 'Historial de asistencias de un socio' })
  @ApiParam({ name: 'idSocio', type: Number })
  @ApiResponse({ status: 200, description: 'Asistencias del socio' })
  findBySocio(@Param('idSocio', ParseIntPipe) idSocio: number) {
    return this.asistenciasService.findBySocio(idSocio);
  }

  @Get(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Obtener asistencia por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos de la asistencia' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciasService.findOne(id);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar registro de asistencia (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Asistencia eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciasService.remove(id);
  }
}
