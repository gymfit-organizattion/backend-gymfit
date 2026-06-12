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
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacionDto, UpdateEvaluacionDto } from './dto/evaluacion.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('Evaluaciones')
@ApiBearerAuth('JWT-auth')
@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Post()
  @Roles('admin', 'entrenador')
  @ApiOperation({
    summary: 'Registrar evaluación física (HU-13)',
    description:
      'Crea una evaluación física para un socio con métricas como peso, talla, IMC, etc.',
  })
  @ApiResponse({ status: 201, description: 'Evaluación registrada' })
  create(@Body() dto: CreateEvaluacionDto, @UsuarioActual() user: Usuario) {
    return this.evaluacionesService.create(
      dto,
      user.id_usuario,
      user.rol.nombre === 'admin',
    );
  }

  @Get()
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Listar todas las evaluaciones' })
  @ApiResponse({ status: 200, description: 'Lista de evaluaciones' })
  findAll() {
    return this.evaluacionesService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Obtener evaluación por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos de la evaluación' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.evaluacionesService.findOne(id);
  }

  @Get('socio/:idSocio')
  @Roles('admin', 'entrenador', 'recepcionista')
  @ApiOperation({ summary: 'Evaluaciones de un socio' })
  @ApiParam({ name: 'idSocio', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Historial de evaluaciones del socio',
  })
  findBySocio(@Param('idSocio', ParseIntPipe) idSocio: number) {
    return this.evaluacionesService.findBySocio(idSocio);
  }

  @Put(':id')
  @Roles('admin', 'entrenador')
  @ApiOperation({ summary: 'Actualizar evaluación' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Evaluación actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEvaluacionDto,
    @UsuarioActual() user: Usuario,
  ) {
    return this.evaluacionesService.update(
      id,
      dto,
      user.id_usuario,
      user.rol.nombre === 'admin',
    );
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar evaluación (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Evaluación eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.evaluacionesService.remove(id);
  }
}
