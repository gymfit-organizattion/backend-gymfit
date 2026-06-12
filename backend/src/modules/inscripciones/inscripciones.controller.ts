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
} from '@nestjs/swagger';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcionDto } from './dto/inscripcion.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Clases')
@ApiBearerAuth('JWT-auth')
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Post()
  @Roles('admin', 'recepcionista', 'socio')
  @ApiOperation({
    summary: 'Inscribir socio a clase (HU-12)',
    description:
      'Inscribe un socio en una clase grupal verificando que haya cupos disponibles.',
  })
  @ApiResponse({ status: 201, description: 'Inscripción creada' })
  @ApiResponse({
    status: 400,
    description: 'Sin cupos disponibles o socio ya inscrito',
  })
  @ApiResponse({ status: 404, description: 'Clase o socio no encontrado' })
  create(@Body() dto: CreateInscripcionDto) {
    return this.inscripcionesService.create(dto);
  }

  @Get()
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Listar todas las inscripciones' })
  @ApiResponse({ status: 200, description: 'Lista de inscripciones' })
  findAll() {
    return this.inscripcionesService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'recepcionista', 'entrenador')
  @ApiOperation({ summary: 'Obtener inscripción por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos de la inscripción' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesService.findOne(id);
  }

  @Get('socio/:idSocio')
  @Roles('admin', 'recepcionista', 'entrenador', 'socio')
  @ApiOperation({ summary: 'Clases en que está inscrito un socio' })
  @ApiParam({ name: 'idSocio', type: Number })
  @ApiResponse({ status: 200, description: 'Inscripciones del socio' })
  findBySocio(@Param('idSocio', ParseIntPipe) idSocio: number) {
    return this.inscripcionesService.findBySocio(idSocio);
  }

  @Get('clase/:idClase')
  @Roles('admin', 'recepcionista', 'entrenador')
  @ApiOperation({ summary: 'Socios inscritos en una clase' })
  @ApiParam({ name: 'idClase', type: Number })
  @ApiResponse({ status: 200, description: 'Inscripciones de la clase' })
  findByClase(@Param('idClase', ParseIntPipe) idClase: number) {
    return this.inscripcionesService.findByClase(idClase);
  }

  @Delete(':id')
  @Roles('admin', 'recepcionista', 'socio')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancelar inscripción',
    description:
      'Cancela la inscripción de un socio a una clase y libera el cupo.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Inscripción cancelada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesService.remove(id);
  }
}
