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
import { MembresiasService } from './membresias.service';
import { CreateMembresiaDto, UpdateMembresiaDto } from './dto/membresia.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Membresías')
@ApiBearerAuth('JWT-auth')
@Controller('membresias')
export class MembresiasController {
  constructor(private readonly membresiasService: MembresiasService) {}

  @Post()
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Crear membresía',
    description: 'Asigna un plan de membresía a un socio.',
  })
  @ApiResponse({ status: 201, description: 'Membresía creada' })
  @ApiResponse({ status: 404, description: 'Socio o plan no encontrado' })
  create(@Body() dto: CreateMembresiaDto) {
    return this.membresiasService.create(dto);
  }

  @Get()
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Listar todas las membresías' })
  @ApiResponse({ status: 200, description: 'Lista de membresías' })
  findAll() {
    return this.membresiasService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Obtener membresía por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos de la membresía' })
  @ApiResponse({ status: 404, description: 'Membresía no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.membresiasService.findOne(id);
  }

  @Get('socio/:idSocio')
  @Roles('admin', 'recepcionista', 'entrenador')
  @ApiOperation({
    summary: 'Membresías de un socio',
    description: 'Retorna el historial de membresías de un socio específico.',
  })
  @ApiParam({ name: 'idSocio', type: Number, description: 'ID del socio' })
  @ApiResponse({ status: 200, description: 'Lista de membresías del socio' })
  findBySocio(@Param('idSocio', ParseIntPipe) idSocio: number) {
    return this.membresiasService.findBySocio(idSocio);
  }

  @Put(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Actualizar membresía' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Membresía actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMembresiaDto,
  ) {
    return this.membresiasService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar membresía (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Membresía eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.membresiasService.remove(id);
  }
}
