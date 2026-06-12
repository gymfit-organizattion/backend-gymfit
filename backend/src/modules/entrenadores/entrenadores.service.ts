import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entrenador } from './entities/entrenador.entity';
import { Asignacion } from './entities/asignacion.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Socio } from '../socios/entities/socio.entity';
import { CreateEntrenadorDto } from './dto/entrenador.dto';
import { UpdateEntrenadorDto } from './dto/update-entrenador.dto';
import { CreateAsignacionDto, BulkAsignacionDto } from './dto/asignacion.dto';

@Injectable()
export class EntrenadoresService {
  constructor(
    @InjectRepository(Entrenador)
    private readonly entrenadorRepo: Repository<Entrenador>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Socio)
    private readonly socioRepo: Repository<Socio>,
  ) {}

  //  ENTRENADORES

  async create(dto: CreateEntrenadorDto): Promise<Entrenador> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: dto.id_usuario },
    });
    if (!usuario)
      throw new NotFoundException(
        `Usuario con id ${dto.id_usuario} no encontrado`,
      );

    const yaExiste = await this.entrenadorRepo.findOne({
      where: { usuario: { id_usuario: dto.id_usuario } },
    });
    if (yaExiste)
      throw new ConflictException(
        'Este usuario ya está registrado como entrenador',
      );

    const entrenador = this.entrenadorRepo.create({
      usuario,
      especialidad: dto.especialidad ?? null,
      experiencia: dto.experiencia ?? null,
    });
    return this.entrenadorRepo.save(entrenador);
  }

  findAll(): Promise<Entrenador[]> {
    return this.entrenadorRepo.find({
      relations: ['usuario', 'usuario.rol', 'clases'],
      order: { id_entrenador: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Entrenador> {
    const e = await this.entrenadorRepo.findOne({
      where: { id_entrenador: id },
      relations: [
        'usuario',
        'usuario.rol',
        'clases',
        'asignaciones',
        'asignaciones.socio',
      ],
    });
    if (!e)
      throw new NotFoundException(`Entrenador con id ${id} no encontrado`);
    return e;
  }

  async update(id: number, dto: UpdateEntrenadorDto): Promise<Entrenador> {
    const e = await this.entrenadorRepo.findOne({
      where: { id_entrenador: id },
    });
    if (!e)
      throw new NotFoundException(`Entrenador con id ${id} no encontrado`);
    if (dto.especialidad !== undefined) e.especialidad = dto.especialidad;
    if (dto.experiencia !== undefined) e.experiencia = dto.experiencia;
    return this.entrenadorRepo.save(e);
  }

  async remove(id: number): Promise<void> {
    const e = await this.entrenadorRepo.findOne({
      where: { id_entrenador: id },
    });
    if (!e)
      throw new NotFoundException(`Entrenador con id ${id} no encontrado`);
    await this.entrenadorRepo.remove(e);
  }

  //  ASIGNACIONES

  async asignar(dto: CreateAsignacionDto): Promise<Asignacion> {
    const entrenador = await this.entrenadorRepo.findOne({
      where: { id_entrenador: dto.id_entrenador },
    });
    if (!entrenador)
      throw new NotFoundException(
        `Entrenador con id ${dto.id_entrenador} no encontrado`,
      );

    const socio = await this.socioRepo.findOne({
      where: { id_socio: dto.id_socio },
    });
    if (!socio)
      throw new NotFoundException(`Socio con id ${dto.id_socio} no encontrado`);

    const asignacion = this.asignacionRepo.create({
      entrenador,
      socio,
      fecha_asignacion: dto.fecha_asignacion,
    });
    return this.asignacionRepo.save(asignacion);
  }

  async asignarMasivo(dto: BulkAsignacionDto): Promise<Asignacion[]> {
    const entrenador = await this.entrenadorRepo.findOne({
      where: { id_entrenador: dto.id_entrenador },
    });
    if (!entrenador)
      throw new NotFoundException(
        `Entrenador con id ${dto.id_entrenador} no encontrado`,
      );

    const asignaciones: Asignacion[] = [];

    for (const idSocio of dto.id_socios) {
      const socio = await this.socioRepo.findOne({
        where: { id_socio: idSocio },
      });
      if (!socio) continue; // O lanzar error según preferencia

      const asignacion = this.asignacionRepo.create({
        entrenador,
        socio,
        fecha_asignacion: dto.fecha_asignacion,
      });
      asignaciones.push(asignacion);
    }

    return this.asignacionRepo.save(asignaciones);
  }

  findAsignacionesByEntrenador(id: number): Promise<Asignacion[]> {
    return this.asignacionRepo.find({
      where: { entrenador: { id_entrenador: id } },
      relations: ['socio', 'socio.usuario'],
    });
  }

  findAsignacionesBySocio(id: number): Promise<Asignacion[]> {
    return this.asignacionRepo.find({
      where: { socio: { id_socio: id } },
      relations: ['entrenador', 'entrenador.usuario'],
    });
  }

  async removeAsignacion(id: number): Promise<void> {
    const a = await this.asignacionRepo.findOne({
      where: { id_asignacion: id },
    });
    if (!a)
      throw new NotFoundException(`Asignación con id ${id} no encontrada`);
    await this.asignacionRepo.remove(a);
  }
}
