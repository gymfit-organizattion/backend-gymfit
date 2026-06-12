import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Reportes')
@ApiBearerAuth('JWT-auth')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('general')
  @Roles('admin')
  @ApiOperation({
    summary: 'Reporte general del gimnasio (HU-21, HU-22)',
    description:
      'Dashboard consolidado: total de socios, membresías activas, asistencias del mes, ingresos estimados y alertas de stock.',
  })
  @ApiResponse({ status: 200, description: 'Reporte general' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente — solo admin' })
  reporteGeneral() {
    return this.reportesService.reporteGeneral();
  }

  @Get('membresias')
  @Roles('admin')
  @ApiOperation({
    summary: 'Reporte financiero de membresías (HU-21)',
    description:
      'Ingresos estimados, distribución por plan y estado, membresías por vencer. Acepta rango de fechas opcional.',
  })
  @ApiQuery({
    name: 'desde',
    required: false,
    type: String,
    example: '2026-01-01',
    description: 'Fecha inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'hasta',
    required: false,
    type: String,
    example: '2026-12-31',
    description: 'Fecha fin (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Reporte de membresías' })
  reporteMembresias(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.reportesService.reporteMembresias(desde, hasta);
  }

  @Get('asistencias')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Reporte de asistencias (HU-22)',
    description:
      'Distribución de asistencias por día, horas pico y top socios más activos. Acepta rango de fechas.',
  })
  @ApiQuery({
    name: 'desde',
    required: false,
    type: String,
    example: '2026-01-01',
    description: 'Fecha inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'hasta',
    required: false,
    type: String,
    example: '2026-12-31',
    description: 'Fecha fin (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Reporte de asistencias' })
  reporteAsistencias(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.reportesService.reporteAsistencias(desde, hasta);
  }

  @Get('inventario')
  @Roles('admin')
  @ApiOperation({
    summary: 'Reporte de inventario (HU-18, HU-19)',
    description:
      'Estado completo del inventario de equipos: stock, valor total, alertas activas y equipos en mantenimiento.',
  })
  @ApiResponse({ status: 200, description: 'Reporte de inventario' })
  reporteInventario() {
    return this.reportesService.reporteInventario();
  }
}
