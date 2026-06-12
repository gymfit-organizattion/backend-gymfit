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
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SociosService } from './socios.service';
import { CreateSocioDto, UpdateSocioDto } from './dto/socio.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Socios')
@ApiBearerAuth('JWT-auth')
@Controller('socios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SociosController {
  constructor(private readonly sociosService: SociosService) {}

  @Post()
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Crear socio',
    description: 'Registra un nuevo miembro del gimnasio.',
  })
  @ApiResponse({ status: 201, description: 'Socio creado correctamente' })
  @ApiResponse({
    status: 409,
    description: 'Identificación o correo duplicado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body() dto: CreateSocioDto) {
    return this.sociosService.create(dto);
  }

  @Get()
  @Roles('admin', 'recepcionista', 'entrenador')
  @ApiOperation({ summary: 'Listar todos los socios' })
  @ApiResponse({ status: 200, description: 'Lista de socios' })
  findAll(@Request() req: any) {
    console.log(
      `[SociosController] findAll called by user: ${req.user?.correo}, role: ${req.user?.rol?.nombre}`,
    );
    return this.sociosService.findAll();
  }

  @Get('perfil/me')
  @Roles('admin', 'socio')
  @ApiOperation({ summary: 'Obtener mi perfil de socio (socio)' })
  async findMyProfile(@Request() req: any) {
    const socio = await this.sociosService.findByUsuario(req.user.id_usuario);
    if (!socio)
      throw new NotFoundException(
        'Perfil de socio no encontrado para este usuario',
      );
    return socio;
  }

  @Get(':id')
  @Roles('admin', 'recepcionista', 'entrenador')
  @ApiOperation({ summary: 'Obtener socio por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos del socio' })
  @ApiResponse({ status: 404, description: 'Socio no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sociosService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Actualizar socio' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Socio actualizado' })
  @ApiResponse({ status: 404, description: 'Socio no encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSocioDto) {
    return this.sociosService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar socio (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Socio eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sociosService.remove(id);
  }
}
