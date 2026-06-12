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
import { AlertasStockService } from './alertas-stock.service';
import {
  CreateAlertaStockDto,
  UpdateAlertaStockDto,
  ResolverAlertaStockDto,
} from './dto/alerta-stock.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Alertas de Stock')
@ApiBearerAuth('JWT-auth')
@Controller('alertas-stock')
export class AlertasStockController {
  constructor(private readonly alertasStockService: AlertasStockService) {}

  @Post()
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Crear alerta de stock manualmente (HU-19)',
    description: 'Crea una alerta de stock manualmente para un equipo.',
  })
  @ApiResponse({ status: 201, description: 'Alerta creada' })
  create(@Body() dto: CreateAlertaStockDto) {
    return this.alertasStockService.create(dto);
  }

  @Get()
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Listar alertas de stock (HU-19)',
    description:
      'Lista todas las alertas. Filtra por estado con el query param.',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['activa', 'resuelta', 'ignorada'],
    description: 'Filtrar por estado de la alerta',
  })
  @ApiResponse({ status: 200, description: 'Lista de alertas de stock' })
  findAll(@Query('estado') estado?: string) {
    return this.alertasStockService.findAll(estado);
  }

  @Get('activas')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Solo alertas activas (HU-19)',
    description: 'Retorna únicamente las alertas en estado activo.',
  })
  @ApiResponse({ status: 200, description: 'Alertas activas' })
  obtenerActivas() {
    return this.alertasStockService.obtenerAlertasActivas();
  }

  @Get('estadisticas')
  @Roles('admin')
  @ApiOperation({
    summary: 'Estadísticas de alertas de stock (admin)',
    description: 'Resumen con totales por estado y tipo de alerta.',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas de alertas' })
  obtenerEstadisticas() {
    return this.alertasStockService.obtenerEstadisticasAlertas();
  }

  @Post('generar-automaticas')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Generar alertas automáticas de stock (HU-19)',
    description:
      'Analiza el stock actual de todos los equipos y genera alertas según los umbrales configurados.',
  })
  @ApiResponse({ status: 201, description: 'Alertas automáticas generadas' })
  generarAutomaticas() {
    return this.alertasStockService.generarAlertasAutomaticas();
  }

  @Get('tipo/:tipo')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Filtrar alertas por tipo' })
  @ApiParam({
    name: 'tipo',
    enum: ['bajo_stock', 'sobre_stock', 'agotado'],
    description: 'Tipo de alerta',
  })
  @ApiResponse({ status: 200, description: 'Alertas del tipo indicado' })
  obtenerPorTipo(
    @Param('tipo') tipo: 'bajo_stock' | 'sobre_stock' | 'agotado',
  ) {
    return this.alertasStockService.obtenerAlertasPorTipo(tipo);
  }

  @Get(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Obtener alerta por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos de la alerta' })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alertasStockService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar alerta (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Alerta actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlertaStockDto,
  ) {
    return this.alertasStockService.update(id, dto);
  }

  @Post(':id/resolver')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Resolver o ignorar una alerta (HU-19)',
    description:
      'Cambia el estado de la alerta a "resuelta" o "ignorada" con una nota opcional.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Alerta resuelta o ignorada' })
  resolver(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolverAlertaStockDto,
  ) {
    return this.alertasStockService.resolverAlerta(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar alerta (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Alerta eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alertasStockService.remove(id);
  }
}
