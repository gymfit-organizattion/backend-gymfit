import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateEquipoDto, UpdateEquipoDto } from './dto/equipo.dto';
import { EquiposService } from './equipos.service';

@ApiTags('Equipos')
@ApiBearerAuth('JWT-auth')
@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({
    summary: 'Crear equipo (HU-18)',
    description: 'Registra un nuevo equipo en el inventario del gimnasio.',
  })
  @ApiResponse({ status: 201, description: 'Equipo creado' })
  create(@Body() dto: CreateEquipoDto) {
    return this.equiposService.create(dto);
  }

  @Get()
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Listar todos los equipos' })
  @ApiResponse({ status: 200, description: 'Inventario completo de equipos' })
  findAll() {
    return this.equiposService.findAll();
  }

  @Get('inventario/bajo-stock')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Equipos con bajo stock (HU-19)',
    description:
      'Lista equipos cuyo stock está por debajo del mínimo configurado.',
  })
  @ApiResponse({ status: 200, description: 'Equipos con bajo stock' })
  obtenerEquiposBajoStock() {
    return this.equiposService.obtenerEquiposBajoStock();
  }

  @Get('inventario/total')
  @Roles('admin')
  @ApiOperation({ summary: 'Inventario total valorizado (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Resumen del inventario con valor total',
  })
  obtenerInventarioTotal() {
    return this.equiposService.obtenerInventarioTotal();
  }

  @Get('inventario/alertas')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Equipos con alertas de stock (HU-19)' })
  @ApiResponse({ status: 200, description: 'Equipos con alertas activas' })
  obtenerEquiposConAlerta() {
    return this.equiposService.obtenerEquiposConAlerta();
  }

  @Post(':id/stock/actualizar')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Actualizar stock de un equipo',
    description:
      'Aumenta o disminuye el stock de un equipo en una cantidad dada.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'cantidad', type: Number, description: 'Unidades a mover' })
  @ApiQuery({
    name: 'operacion',
    enum: ['aumentar', 'disminuir'],
    description: 'Dirección del movimiento',
  })
  @ApiResponse({ status: 200, description: 'Stock actualizado' })
  actualizarStock(
    @Param('id', ParseIntPipe) id: number,
    @Query('cantidad', ParseIntPipe) cantidad: number,
    @Query('operacion') operacion: 'aumentar' | 'disminuir',
  ) {
    return this.equiposService.actualizarStock(id, cantidad, operacion);
  }

  @Get(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Obtener equipo por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos del equipo' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equiposService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar equipo (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Equipo actualizado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEquipoDto) {
    return this.equiposService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar equipo (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Equipo eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.equiposService.remove(id);
  }
}
