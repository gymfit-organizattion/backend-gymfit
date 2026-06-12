import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { Rol } from '../roles/entities/rol.entity';
import { CreateUsuarioDto } from './dto/usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  private readonly saltRounds: number;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
    private readonly config: ConfigService,
  ) {
    // parseInt garantiza número entero sin importar cómo ConfigService
    // devuelva el valor del .env (siempre llega como string)
    const raw = this.config.get<string>('BCRYPT_SALT_ROUNDS', '10');
    this.saltRounds = parseInt(raw, 10) || 10;
  }

  //  Crear nuevo usuario
  async create(dto: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const correoExiste = await this.usuarioRepo.findOne({
      where: { correo: dto.correo },
    });
    if (correoExiste)
      throw new ConflictException('El correo ya está registrado');

    const idExiste = await this.usuarioRepo.findOne({
      where: { identificacion: dto.identificacion },
    });
    if (idExiste)
      throw new ConflictException('La identificación ya está registrada');

    const rol = await this.rolRepo.findOne({ where: { id_rol: dto.id_rol } });
    if (!rol)
      throw new NotFoundException(`Rol con id ${dto.id_rol} no encontrado`);

    const hash = await bcrypt.hash(dto.password, this.saltRounds);
    const usuario = this.usuarioRepo.create({ ...dto, password: hash, rol });
    const guardado = await this.usuarioRepo.save(usuario);

    const { password, ...resultado } = guardado;
    return resultado as Omit<Usuario, 'password'>;
  }

  //  Listar todos
  async findAll(): Promise<Omit<Usuario, 'password'>[]> {
    const usuarios = await this.usuarioRepo.find({
      relations: ['rol'],
      order: { id_usuario: 'ASC' },
    });
    return usuarios.map(({ password, ...u }) => u as Omit<Usuario, 'password'>);
  }

  //  Buscar por id
  async findOne(id: number): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: id },
      relations: ['rol'],
    });
    if (!usuario)
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    const { password, ...resultado } = usuario;
    return resultado as Omit<Usuario, 'password'>;
  }

  //  Actualizar
  async update(
    id: number,
    dto: UpdateUsuarioDto,
  ): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: id },
      relations: ['rol'],
    });
    if (!usuario)
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);

    if (dto.id_rol) {
      const rol = await this.rolRepo.findOne({ where: { id_rol: dto.id_rol } });
      if (!rol)
        throw new NotFoundException(`Rol con id ${dto.id_rol} no encontrado`);
      usuario.rol = rol;
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, this.saltRounds);
    }

    Object.assign(usuario, dto);
    const guardado = await this.usuarioRepo.save(usuario);
    const { password, ...resultado } = guardado;
    return resultado as Omit<Usuario, 'password'>;
  }

  // Eliminar (soft-delete: estado
  async remove(id: number): Promise<void> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: id },
    });
    if (!usuario)
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    usuario.estado = false;
    await this.usuarioRepo.save(usuario);
  }
}
