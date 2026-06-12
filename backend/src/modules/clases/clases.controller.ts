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
import { ClasesService } from './clases.service';
import { CreateClaseDto } from './dto/clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Clases')
@ApiBearerAuth('JWT-auth')
@Controller('clases')
export class ClasesController {
  constructor(private readonly clasesService: ClasesService) {}

  @Post()
  @Roles('admin', 'entrenador')
  @ApiOperation({
    summary: 'Crear clase grupal (HU-11)',
    description:
      'Programa una nueva clase grupal con entrenador, horario y cupo máximo.',
  })
  @ApiResponse({ status: 201, description: 'Clase creada' })
  create(@Body() dto: CreateClaseDto) {
    return this.clasesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las clases',
    description:
      'Retorna todas las clases disponibles. Accesible sin restricción de rol.',
  })
  @ApiResponse({ status: 200, description: 'Lista de clases' })
  findAll() {
    return this.clasesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener clase por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos de la clase' })
  @ApiResponse({ status: 404, description: 'Clase no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clasesService.findOne(id);
  }

  @Get(':id/cupos')
  @ApiOperation({
    summary: 'Cupos disponibles de una clase',
    description: 'Retorna el número de cupos disponibles en tiempo real.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Cupos disponibles' })
  getCuposDisponibles(@Param('id', ParseIntPipe) id: number) {
    return this.clasesService.getCuposDisponibles(id);
  }

  @Put(':id')
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Actualizar clase' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Clase actualizada' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClaseDto) {
    return this.clasesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar clase (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Clase eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clasesService.remove(id);
  }
}
