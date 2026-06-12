import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Prospecto } from './entities/prospecto.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Rol } from '../roles/entities/rol.entity';
import {
  CreateProspectoDto,
  UpdateProspectoDto,
  ConvertirProspectoDto,
} from './dto/prospecto.dto';

@Injectable()
export class ProspectosService {
  constructor(
    @InjectRepository(Prospecto)
    private readonly prospectoRepo: Repository<Prospecto>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Socio)
    private readonly socioRepo: Repository<Socio>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) {}

  create(dto: CreateProspectoDto): Promise<Prospecto> {
    const prospecto = this.prospectoRepo.create({
      nombre: dto.nombre,
      telefono: dto.telefono ?? null,
      interes: dto.interes ?? null,
      origen: dto.origen ?? null,
      estado: 'Pendiente',
    });
    return this.prospectoRepo.save(prospecto);
  }

  findAll(): Promise<Prospecto[]> {
    return this.prospectoRepo.find({
      order: { fecha_registro: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Prospecto> {
    const p = await this.prospectoRepo.findOne({
      where: { id_prospecto: id },
    });
    if (!p) throw new NotFoundException(`Prospecto con id ${id} no encontrado`);
    return p;
  }

  async update(id: number, dto: UpdateProspectoDto): Promise<Prospecto> {
    const p = await this.findOne(id);
    if (dto.nombre !== undefined) p.nombre = dto.nombre;
    if (dto.telefono !== undefined) p.telefono = dto.telefono ?? null;
    if (dto.interes !== undefined) p.interes = dto.interes ?? null;
    if (dto.origen !== undefined) p.origen = dto.origen ?? null;
    if (dto.estado !== undefined) p.estado = dto.estado ?? p.estado;
    return this.prospectoRepo.save(p);
  }

  async convertir(
    id: number,
    dto: ConvertirProspectoDto,
  ): Promise<{ mensaje: string; socio: Socio }> {
    const prospecto = await this.findOne(id);

    if (prospecto.estado === 'Convertido') {
      throw new ConflictException('Este prospecto ya fue convertido a socio.');
    }

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

    const rol = await this.rolRepo.findOne({ where: { nombre: 'socio' } });
    if (!rol)
      throw new NotFoundException(
        'Rol de socio no encontrado en la base de datos',
      );

    const hash = await bcrypt.hash(dto.password, 10);

    // Crear Usuario
    const usuario = this.usuarioRepo.create({
      nombre: prospecto.nombre,
      identificacion: dto.identificacion,
      correo: dto.correo,
      password: hash,
      telefono: prospecto.telefono,
      rol,
      estado: true,
    });
    const savedUsuario = await this.usuarioRepo.save(usuario);

    // Crear Socio
    const socio = this.socioRepo.create({
      usuario: savedUsuario,
      prospecto: prospecto,
      direccion: dto.direccion || null,
      datos_salud: dto.datos_salud || null,
    });
    const savedSocio = await this.socioRepo.save(socio);

    // Actualizar Prospecto
    prospecto.estado = 'Convertido';
    await this.prospectoRepo.save(prospecto);

    return { mensaje: 'Prospecto convertido exitosamente', socio: savedSocio };
  }

  async remove(id: number): Promise<void> {
    const p = await this.findOne(id);
    await this.prospectoRepo.remove(p);
  }
}
