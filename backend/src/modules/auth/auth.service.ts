import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Rol } from '../roles/entities/rol.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { JwtPayload } from './estrategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly saltRounds: number;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    const raw = this.config.get<string>('BCRYPT_SALT_ROUNDS', '10');
    this.saltRounds = parseInt(raw, 10) || 10;
  }

  //  Register (HU-01)
  async register(dto: RegisterDto) {
    const correoExiste = await this.usuariosRepo.findOne({
      where: { correo: dto.correo },
    });
    if (correoExiste)
      throw new ConflictException('El correo ya está registrado');

    const idExiste = await this.usuariosRepo.findOne({
      where: { identificacion: dto.identificacion },
    });
    if (idExiste)
      throw new ConflictException('La identificación ya está registrada');

    const rol = await this.rolRepo.findOne({ where: { id_rol: dto.id_rol } });
    if (!rol)
      throw new NotFoundException(`Rol con id ${dto.id_rol} no encontrado`);

    const hash = await bcrypt.hash(dto.password, this.saltRounds);
    const usuario = this.usuariosRepo.create({
      nombre: dto.nombre,
      identificacion: dto.identificacion,
      correo: dto.correo,
      password: hash,
      telefono: dto.telefono ?? null,
      rol,
      estado: true,
    });
    const guardado = await this.usuariosRepo.save(usuario);

    const payload: JwtPayload = {
      sub: guardado.id_usuario,
      correo: guardado.correo,
      rol: rol.nombre,
    };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id_usuario: guardado.id_usuario,
        nombre: guardado.nombre,
        correo: guardado.correo,
        rol: rol.nombre,
      },
    };
  }

  //  Login (HU-02)
  async login(dto: LoginDto) {
    const usuario = await this.usuariosRepo.findOne({
      where: { correo: dto.correo },
      relations: ['rol'],
    });
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');
    if (!usuario.estado)
      throw new UnauthorizedException('El usuario está inactivo');

    if (
      usuario.bloqueado_hasta &&
      new Date(usuario.bloqueado_hasta) > new Date()
    ) {
      throw new UnauthorizedException(
        'Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intente más tarde.',
      );
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValida) {
      usuario.intentos_fallidos += 1;
      if (usuario.intentos_fallidos >= 3) {
        usuario.bloqueado_hasta = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
      }
      await this.usuariosRepo.save(usuario);
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Resetear intentos al tener éxito
    if (usuario.intentos_fallidos > 0 || usuario.bloqueado_hasta) {
      usuario.intentos_fallidos = 0;
      usuario.bloqueado_hasta = null;
      await this.usuariosRepo.save(usuario);
    }

    const payload: JwtPayload = {
      sub: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol.nombre,
    };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol.nombre,
      },
    };
  }

  //  Perfil (HU-03)
  async perfil(id: number): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.usuariosRepo.findOne({
      where: { id_usuario: id },
      relations: ['rol'],
    });
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');
    const { password, ...resultado } = usuario;
    return resultado as Omit<Usuario, 'password'>;
  }

  //  Actualizar perfil propio — campos no críticos (HU-03)
  async actualizarPerfil(
    id: number,
    dto: ActualizarPerfilDto,
  ): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.usuariosRepo.findOne({
      where: { id_usuario: id },
      relations: ['rol'],
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Solo campos no críticos: nombre y teléfono
    if (dto.nombre !== undefined) usuario.nombre = dto.nombre.trim();
    if (dto.telefono !== undefined)
      usuario.telefono = dto.telefono.trim() || null;

    const guardado = await this.usuariosRepo.save(usuario);
    const { password, ...resultado } = guardado;
    return resultado as Omit<Usuario, 'password'>;
  }

  //  Cambiar contraseña propia con validación actual (HU-03)
  async cambiarPassword(
    id: number,
    dto: CambiarPasswordDto,
  ): Promise<{ mensaje: string }> {
    const usuario = await this.usuariosRepo.findOne({
      where: { id_usuario: id },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Validar que la contraseña actual sea correcta con bcrypt
    const actualCorrecta = await bcrypt.compare(
      dto.password_actual,
      usuario.password,
    );
    if (!actualCorrecta) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    // No permitir reutilizar la misma contraseña
    const mismaPassword = await bcrypt.compare(
      dto.password_nueva,
      usuario.password,
    );
    if (mismaPassword) {
      throw new BadRequestException(
        'La contraseña nueva no puede ser igual a la actual',
      );
    }

    // Hashear y guardar la nueva contraseña
    usuario.password = await bcrypt.hash(dto.password_nueva, this.saltRounds);
    await this.usuariosRepo.save(usuario);

    return { mensaje: 'Contraseña actualizada correctamente' };
  }
}
