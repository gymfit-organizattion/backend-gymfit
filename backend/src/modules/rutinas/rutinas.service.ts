import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Rutina } from './entities/rutina.entity';
import { RutinaEjercicio } from './entities/rutina-ejercicio.entity';
import { AsignacionRutina } from './entities/asignacion-rutina.entity';
import { Ejercicio } from '../ejercicios/entities/ejercicio.entity';
import { Socio } from '../socios/entities/socio.entity';
import { CreateRutinaDto, UpdateRutinaDto } from './dto/rutina.dto';
import { CreateAsignacionRutinaDto } from './dto/asignacion-rutina.dto';

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

  //  RUTINAS 

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
          const ejercicio = await this.ejercicioRepo.findOne({ where: { id_ejercicio: item.id_ejercicio } });
          if (!ejercicio) throw new NotFoundException(`Ejercicio con id ${item.id_ejercicio} no encontrado`);
          const re = manager.create(RutinaEjercicio, {
            rutina: rutinaSaved,
            ejercicio,
            series: item.series ?? null,
            repeticiones: item.repeticiones ?? null,
            descanso: item.descanso ?? null,
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
        'rutina_ejercicios', 'rutina_ejercicios.ejercicio',
        'asignaciones', 'asignaciones.socio', 'asignaciones.socio.usuario',
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

  //  ASIGNACIONES RUTINA → SOCIO 

  async asignarRutina(dto: CreateAsignacionRutinaDto): Promise<AsignacionRutina> {
    const rutina = await this.rutinaRepo.findOne({ where: { id_rutina: dto.id_rutina } });
    if (!rutina) throw new NotFoundException(`Rutina con id ${dto.id_rutina} no encontrada`);

    const socio = await this.socioRepo.findOne({ where: { id_socio: dto.id_socio } });
    if (!socio) throw new NotFoundException(`Socio con id ${dto.id_socio} no encontrado`);

    const asignacion = this.asignacionRutinaRepo.create({
      rutina, socio, fecha_asignacion: dto.fecha_asignacion,
    });
    return this.asignacionRutinaRepo.save(asignacion);
  }

  findAsignacionesBySocio(idSocio: number): Promise<AsignacionRutina[]> {
    return this.asignacionRutinaRepo.find({
      where: { socio: { id_socio: idSocio } },
      relations: ['rutina', 'rutina.rutina_ejercicios', 'rutina.rutina_ejercicios.ejercicio'],
      order: { fecha_asignacion: 'DESC' },
    });
  }

  async removeAsignacion(id: number): Promise<void> {
    const a = await this.asignacionRutinaRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Asignación de rutina con id ${id} no encontrada`);
    await this.asignacionRutinaRepo.remove(a);
  }
}
