import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Rutina } from './entities/rutina.entity';
import { RutinaEjercicio } from './entities/rutina-ejercicio.entity';
import { AsignacionRutina } from './entities/asignacion-rutina.entity';
import { Ejercicio } from '../ejercicios/entities/ejercicio.entity';
import { Socio } from '../socios/entities/socio.entity';
import { CreateRutinaDto, UpdateRutinaDto } from './dto/rutina.dto';
import { CreateAsignacionRutinaDto } from './dto/asignacion-rutina.dto';
import { RutinaEjercicioItemDto } from './dto/rutina-ejercicio.dto';

@Injectable()
export class RutinasService {
  constructor(
    @InjectRepository(Rutina)
    private readonly rutinaRepo: Repository<Rutina>,
    @InjectRepository(RutinaEjercicio)
    private readonly rutinaEjercicioRepo: Repository<RutinaEjercicio>,
    @InjectRepository(AsignacionRutina)
    private readonly asignacionRutinaRepo: Repository<AsignacionRutina>,
    @InjectRepository(Ejercicio)
    private readonly ejercicioRepo: Repository<Ejercicio>,
    @InjectRepository(Socio)
    private readonly socioRepo: Repository<Socio>,
    private readonly dataSource: DataSource,
  ) {}

  // ── RUTINAS ──────────────────────────────────────────────────────────────

  async create(dto: CreateRutinaDto): Promise<Rutina> {
    return this.dataSource.transaction(async (manager) => {
      const rutina = manager.create(Rutina, {
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        nivel: dto.nivel ?? null,
        objetivo: dto.objetivo ?? null,
      });
      const rutinaSaved = await manager.save(rutina);

      if (dto.ejercicios?.length) {
        for (const item of dto.ejercicios) {
          const ejercicio = await this.ejercicioRepo.findOne({
            where: { id_ejercicio: item.id_ejercicio },
          });
          if (!ejercicio) {
            throw new NotFoundException(
              `Ejercicio con id ${item.id_ejercicio} no encontrado`,
            );
          }
          const re = manager.create(RutinaEjercicio, {
            rutina: rutinaSaved,
            ejercicio,
            series: item.series ?? null,
            repeticiones: item.repeticiones ?? null,
            descanso: item.descanso ?? null,
            observaciones: item.observaciones ?? null,
          });
          await manager.save(re);
        }
      }
      return rutinaSaved;
    });
  }

  findAll(): Promise<Rutina[]> {
    return this.rutinaRepo.find({
      relations: ['rutina_ejercicios', 'rutina_ejercicios.ejercicio'],
      order: { id_rutina: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Rutina> {
    const r = await this.rutinaRepo.findOne({
      where: { id_rutina: id },
      relations: [
        'rutina_ejercicios',
        'rutina_ejercicios.ejercicio',
        'asignaciones',
        'asignaciones.socio',
        'asignaciones.socio.usuario',
      ],
    });
    if (!r) throw new NotFoundException(`Rutina con id ${id} no encontrada`);
    return r;
  }

  async update(id: number, dto: UpdateRutinaDto): Promise<Rutina> {
    const r = await this.rutinaRepo.findOne({ where: { id_rutina: id } });
    if (!r) throw new NotFoundException(`Rutina con id ${id} no encontrada`);
    if (dto.nombre !== undefined) r.nombre = dto.nombre;
    if (dto.descripcion !== undefined) r.descripcion = dto.descripcion ?? null;
    if (dto.nivel !== undefined) r.nivel = dto.nivel ?? null;
    if (dto.objetivo !== undefined) r.objetivo = dto.objetivo ?? null;
    return this.rutinaRepo.save(r);
  }

  async remove(id: number): Promise<void> {
    const r = await this.rutinaRepo.findOne({ where: { id_rutina: id } });
    if (!r) throw new NotFoundException(`Rutina con id ${id} no encontrada`);
    await this.rutinaRepo.remove(r);
  }

  // ── GESTIÓN DE EJERCICIOS EN UNA RUTINA EXISTENTE ────────────────────────

  /**
   * Agrega un ejercicio del catálogo a una rutina existente.
   * Lanza ConflictException si el ejercicio ya está en la rutina.
   */
  async agregarEjercicioARutina(
    idRutina: number,
    dto: RutinaEjercicioItemDto,
  ): Promise<RutinaEjercicio> {
    const rutina = await this.rutinaRepo.findOne({
      where: { id_rutina: idRutina },
    });
    if (!rutina)
      throw new NotFoundException(`Rutina con id ${idRutina} no encontrada`);

    const ejercicio = await this.ejercicioRepo.findOne({
      where: { id_ejercicio: dto.id_ejercicio },
    });
    if (!ejercicio) {
      throw new NotFoundException(
        `Ejercicio con id ${dto.id_ejercicio} no encontrado`,
      );
    }

    // Verificar duplicado
    const existe = await this.rutinaEjercicioRepo.findOne({
      where: {
        rutina: { id_rutina: idRutina },
        ejercicio: { id_ejercicio: dto.id_ejercicio },
      },
    });
    if (existe) {
      throw new ConflictException(
        `El ejercicio "${ejercicio.nombre}" ya está en esta rutina`,
      );
    }

    const re = this.rutinaEjercicioRepo.create({
      rutina,
      ejercicio,
      series: dto.series ?? null,
      repeticiones: dto.repeticiones ?? null,
      descanso: dto.descanso ?? null,
      observaciones: dto.observaciones ?? null,
    });
    return this.rutinaEjercicioRepo.save(re);
  }

  /**
   * Actualiza series/reps/descanso/observaciones de un ejercicio dentro de una rutina.
   */
  async actualizarEjercicioDeRutina(
    idRutina: number,
    idRutinaEjercicio: number,
    dto: Partial<RutinaEjercicioItemDto>,
  ): Promise<RutinaEjercicio> {
    const re = await this.rutinaEjercicioRepo.findOne({
      where: { id: idRutinaEjercicio, rutina: { id_rutina: idRutina } },
      relations: ['ejercicio'],
    });
    if (!re) {
      throw new NotFoundException(
        `Ejercicio ${idRutinaEjercicio} no encontrado en la rutina ${idRutina}`,
      );
    }
    if (dto.series !== undefined) re.series = dto.series ?? null;
    if (dto.repeticiones !== undefined)
      re.repeticiones = dto.repeticiones ?? null;
    if (dto.descanso !== undefined) re.descanso = dto.descanso ?? null;
    if (dto.observaciones !== undefined)
      re.observaciones = dto.observaciones ?? null;
    return this.rutinaEjercicioRepo.save(re);
  }

  /**
   * Elimina un ejercicio de una rutina (por id del registro rutina_ejercicio).
   */
  async quitarEjercicioDeRutina(
    idRutina: number,
    idRutinaEjercicio: number,
  ): Promise<void> {
    const re = await this.rutinaEjercicioRepo.findOne({
      where: { id: idRutinaEjercicio, rutina: { id_rutina: idRutina } },
    });
    if (!re) {
      throw new NotFoundException(
        `Ejercicio ${idRutinaEjercicio} no encontrado en la rutina ${idRutina}`,
      );
    }
    await this.rutinaEjercicioRepo.remove(re);
  }

  // ── ASIGNACIONES RUTINA → SOCIO ──────────────────────────────────────────

  async asignarRutina(
    dto: CreateAsignacionRutinaDto,
  ): Promise<AsignacionRutina> {
    const rutina = await this.rutinaRepo.findOne({
      where: { id_rutina: dto.id_rutina },
    });
    if (!rutina)
      throw new NotFoundException(
        `Rutina con id ${dto.id_rutina} no encontrada`,
      );

    const socio = await this.socioRepo.findOne({
      where: { id_socio: dto.id_socio },
    });
    if (!socio)
      throw new NotFoundException(`Socio con id ${dto.id_socio} no encontrado`);

    const asignacion = this.asignacionRutinaRepo.create({
      rutina,
      socio,
      fecha_asignacion: dto.fecha_asignacion,
    });
    return this.asignacionRutinaRepo.save(asignacion);
  }

  findAsignacionesBySocio(idSocio: number): Promise<AsignacionRutina[]> {
    return this.asignacionRutinaRepo.find({
      where: { socio: { id_socio: idSocio } },
      relations: [
        'rutina',
        'rutina.rutina_ejercicios',
        'rutina.rutina_ejercicios.ejercicio',
      ],
      order: { fecha_asignacion: 'DESC' },
    });
  }

  async removeAsignacion(id: number): Promise<void> {
    const a = await this.asignacionRutinaRepo.findOne({ where: { id } });
    if (!a)
      throw new NotFoundException(
        `Asignación de rutina con id ${id} no encontrada`,
      );
    await this.asignacionRutinaRepo.remove(a);
  }
}
