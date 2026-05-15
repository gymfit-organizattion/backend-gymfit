import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socio }     from './entities/socio.entity';
import { Usuario }   from '../usuarios/entities/usuario.entity';
import { Prospecto } from '../prospectos/entities/prospecto.entity';
import { CreateSocioDto, UpdateSocioDto } from './dto/socio.dto';

@Injectable()
export class SociosService {
  constructor(
    @InjectRepository(Socio)
    private readonly socioRepo: Repository<Socio>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Prospecto)
    private readonly prospectoRepo: Repository<Prospecto>,
  ) {}

  async create(dto: CreateSocioDto): Promise<Socio> {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: dto.id_usuario },
    });
    if (!usuario)
      throw new NotFoundException(`Usuario con id ${dto.id_usuario} no encontrado`);

    // Verificar que no sea ya socio
    const yaExiste = await this.socioRepo.findOne({
      where: { usuario: { id_usuario: dto.id_usuario } },
    });
    if (yaExiste)
      throw new ConflictException('Este usuario ya está registrado como socio');

    // Vincular prospecto si se proporcionó
    let prospecto: Prospecto | null = null;
    if (dto.id_prospecto) {
      prospecto = await this.prospectoRepo.findOne({
        where: { id_prospecto: dto.id_prospecto },
      });
      if (!prospecto)
        throw new NotFoundException(`Prospecto con id ${dto.id_prospecto} no encontrado`);
    }

    const socio = this.socioRepo.create({
      usuario,
      prospecto,
      direccion:   dto.direccion   ?? null,
      datos_salud: dto.datos_salud ?? null,
    });
    return this.socioRepo.save(socio);
  }

  findAll(): Promise<Socio[]> {
    return this.socioRepo.find({
      relations: ['usuario', 'usuario.rol', 'prospecto', 'membresias', 'membresias.plan'],
      order: { id_socio: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Socio> {
    const socio = await this.socioRepo.findOne({
      where: { id_socio: id },
      relations: [
        'usuario', 'usuario.rol',
        'prospecto',
        'membresias', 'membresias.plan',
        'evaluaciones',
        'progresos',
        'asistencias',
        'asignaciones_rutina', 'asignaciones_rutina.rutina',
        'asignaciones_entrenador', 'asignaciones_entrenador.entrenador', 'asignaciones_entrenador.entrenador.usuario',
      ],
    });
    if (!socio)
      throw new NotFoundException(`Socio con id ${id} no encontrado`);
    return socio;
  }

  async update(id: number, dto: UpdateSocioDto): Promise<Socio> {
    const socio = await this.socioRepo.findOne({ where: { id_socio: id } });
    if (!socio) throw new NotFoundException(`Socio con id ${id} no encontrado`);

    if (dto.id_prospecto !== undefined) {
      if (dto.id_prospecto === null) {
        socio.prospecto = null;
      } else {
        const prospecto = await this.prospectoRepo.findOne({
          where: { id_prospecto: dto.id_prospecto },
        });
        if (!prospecto)
          throw new NotFoundException(`Prospecto con id ${dto.id_prospecto} no encontrado`);
        socio.prospecto = prospecto;
      }
    }

    if (dto.direccion   !== undefined) socio.direccion   = dto.direccion   ?? null;
    if (dto.datos_salud !== undefined) socio.datos_salud = dto.datos_salud ?? null;

    return this.socioRepo.save(socio);
  }

  // Soft-delete: marca el socio como inactivo en lugar de eliminarlo.
  // Preserva todas las relaciones (asistencias, evaluaciones, progreso, etc.)
  async remove(id: number): Promise<void> {
    const socio = await this.socioRepo.findOne({ where: { id_socio: id } });
    if (!socio) throw new NotFoundException(`Socio con id ${id} no encontrado`);
    socio.activo = false;
    await this.socioRepo.save(socio);
  }

  async findByUsuario(idUsuario: number): Promise<Socio | null> {
    return this.socioRepo.findOne({
      where: { usuario: { id_usuario: idUsuario } },
      relations: ['usuario', 'usuario.rol', 'membresias', 'membresias.plan'],
    });
  }
}
