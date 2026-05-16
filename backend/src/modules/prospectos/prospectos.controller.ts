import {
  Controller, Get, Post, Body, Param,
  Put, Delete, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProspectosService } from './prospectos.service';
import { CreateProspectoDto, UpdateProspectoDto, ConvertirProspectoDto } from './dto/prospecto.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Prospectos')
@ApiBearerAuth('JWT-auth')
@Controller('prospectos')
export class ProspectosController {
  constructor(private readonly prospectosService: ProspectosService) {}

  @Post()
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Registrar prospecto (HU-15)', description: 'Registra un cliente potencial interesado en el gimnasio.' })
  @ApiResponse({ status: 201, description: 'Prospecto registrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body() dto: CreateProspectoDto) { return this.prospectosService.create(dto); }

  @Get()
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Listar todos los prospectos' })
  @ApiResponse({ status: 200, description: 'Lista de prospectos' })
  findAll() { return this.prospectosService.findAll(); }

  @Get(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Obtener prospecto por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos del prospecto' })
  @ApiResponse({ status: 404, description: 'Prospecto no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.prospectosService.findOne(id); }

  @Put(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Actualizar prospecto (HU-15)', description: 'Actualiza estado, notas y datos del prospecto.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Prospecto actualizado' })
  @ApiResponse({ status: 404, description: 'Prospecto no encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProspectoDto) { return this.prospectosService.update(id, dto); }

  @Post(':id/convertir')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Convertir prospecto a socio (HU-05)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 201, description: 'Prospecto convertido a socio exitosamente' })
  convertir(@Param('id', ParseIntPipe) id: number, @Body() dto: ConvertirProspectoDto) { 
    return this.prospectosService.convertir(id, dto); 
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar prospecto (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Prospecto eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.prospectosService.remove(id); }
}
