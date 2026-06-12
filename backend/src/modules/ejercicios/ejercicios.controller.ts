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
import { EjerciciosService } from './ejercicios.service';
import { CreateEjercicioDto, UpdateEjercicioDto } from './dto/ejercicio.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Rutinas')
@ApiBearerAuth('JWT-auth')
@Controller('ejercicios')
export class EjerciciosController {
  constructor(private readonly ejerciciosService: EjerciciosService) {}

  @Post()
  @Roles('admin', 'entrenador')
  @ApiOperation({
    summary: 'Crear ejercicio',
    description: 'Agrega un ejercicio al catálogo general.',
  })
  @ApiResponse({ status: 201, description: 'Ejercicio creado' })
  create(@Body() dto: CreateEjercicioDto) {
    return this.ejerciciosService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los ejercicios',
    description: 'Catálogo completo de ejercicios disponibles.',
  })
  @ApiResponse({ status: 200, description: 'Lista de ejercicios' })
  findAll() {
    return this.ejerciciosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ejercicio por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos del ejercicio' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ejerciciosService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Actualizar ejercicio' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Ejercicio actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEjercicioDto,
  ) {
    return this.ejerciciosService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar ejercicio (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Ejercicio eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ejerciciosService.remove(id);
  }
}
