import {
  Controller,
  Post,
  Put,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { RegistroConCodigoDto } from './dto/registro-participante.dto';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── HU-01: Registro ──────────────────────────────────────────

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea un nuevo usuario en el sistema. ' +
      'Verifica correo único, identificación única y que el rol exista. ' +
      'Retorna un JWT listo para usar.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado — retorna access_token y datos del usuario',
  })
  @ApiResponse({ status: 400, description: 'Datos de validación incorrectos' })
  @ApiResponse({ status: 404, description: 'El rol indicado no existe' })
  @ApiResponse({
    status: 409,
    description: 'El correo o la identificación ya están registrados',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ─── HU-02: Login ─────────────────────────────────────────────

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario con correo y contraseña. ' +
      'Verifica que la cuenta esté activa. ' +
      'Retorna un JWT con duración de 8 horas.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso — retorna access_token y datos del usuario',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales incorrectas o usuario inactivo',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ─── HU-03: Perfil ────────────────────────────────────────────

  @Get('perfil')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Ver perfil propio',
    description:
      'Retorna los datos completos del usuario autenticado (sin contraseña).',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del perfil del usuario autenticado',
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  perfil(@UsuarioActual() usuario: Usuario) {
    return this.authService.perfil(usuario.id_usuario);
  }

  @Put('perfil')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar perfil propio',
    description:
      'Actualiza nombre y/o teléfono del usuario autenticado. ' +
      'Correo e identificación no son editables desde este endpoint.',
  })
  @ApiBody({ type: ActualizarPerfilDto })
  @ApiResponse({ status: 200, description: 'Perfil actualizado correctamente' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  actualizarPerfil(
    @UsuarioActual() usuario: Usuario,
    @Body() dto: ActualizarPerfilDto,
  ) {
    return this.authService.actualizarPerfil(usuario.id_usuario, dto);
  }

  @Put('perfil/password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cambiar contraseña propia',
    description:
      'Cambia la contraseña del usuario autenticado. ' +
      'Requiere la contraseña actual (verificada con bcrypt) antes de permitir el cambio.',
  })
  @ApiBody({ type: CambiarPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Contraseña actual incorrecta o nueva igual a la actual',
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  cambiarPassword(
    @UsuarioActual() usuario: Usuario,
    @Body() dto: CambiarPasswordDto,
  ) {
    return this.authService.cambiarPassword(usuario.id_usuario, dto);
  }

  // ─── HU Códigos de Participante ────────────────────────────────

  @Post('generar-codigo')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Generar código de participante',
    description: 'Genera un código de un solo uso para registrar un participante. Solo para admin/staff.',
  })
  @ApiResponse({ status: 201, description: 'Código generado exitosamente' })
  generarCodigo(@UsuarioActual() usuario: Usuario) {
   
    return this.authService.generarCodigo(usuario.id_usuario);
  }

  @Get('codigos-participante')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar códigos de participante',
    description: 'Lista todos los códigos generados y su estado. Solo para admin/staff.',
  })
  @ApiResponse({ status: 200, description: 'Lista de códigos retornada' })
  listarCodigos() {
    return this.authService.listarCodigos();
  }

  @Public()
  @Post('registro-participante')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registro con código de participante',
    description: 'Registra un nuevo usuario usando un código de un solo uso.',
  })
  @ApiBody({ type: RegistroConCodigoDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente con el código' })
  @ApiResponse({ status: 400, description: 'Código inválido, usado o datos incorrectos' })
  registrarConCodigo(@Body() dto: RegistroConCodigoDto) {
    return this.authService.registrarConCodigo(dto);
  }
}
