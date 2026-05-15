import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progreso } from './entities/progreso.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Evaluacion } from '../evaluaciones/entities/evaluacion.entity';
import { CreateProgresoDto, UpdateProgresoDto } from './dto/progreso.dto';

@Injectable()
export class ProgresoService {
  constructor(
    @InjectRepository(Progreso)
    private readonly progresoRepo: Repository<Progreso>,
    @InjectRepository(Socio)
    private readonly socioRepo: Repository<Socio>,
    @InjectRepository(Evaluacion)
    private readonly evaluacionRepo: Repository<Evaluacion>,
  ) {}

  async getComparativa(idSocio: number) {
    const socio = await this.socioRepo.findOne({ where: { id_socio: idSocio } });
    if (!socio) throw new NotFoundException(`Socio con id ${idSocio} no encontrado`);

    // Obtener la primera evaluación (inicial)
    const inicial = await this.evaluacionRepo.findOne({
      where: { socio: { id_socio: idSocio } },
      order: { fecha: 'ASC' },
    });

    // Obtener todos los progresos
    const historial = await this.progresoRepo.find({
      where: { socio: { id_socio: idSocio } },
      order: { fecha: 'ASC' },
    });

    return {
      socio_id: idSocio,
      evaluacion_inicial: inicial,
      historial_progreso: historial,
    };
  }

  async create(dto: CreateProgresoDto): Promise<Progreso> {
    const socio = await this.socioRepo.findOne({ where: { id_socio: dto.id_socio } });
    if (!socio) throw new NotFoundException(`Socio con id ${dto.id_socio} no encontrado`);

    const progreso = this.progresoRepo.create({
      socio,
      peso: dto.peso ?? null,
      observaciones: dto.observaciones ?? null,
      fecha: dto.fecha,
    });
    return this.progresoRepo.save(progreso);
  }

  findAll(): Promise<Progreso[]> {
    return this.progresoRepo.find({
      relations: ['socio', 'socio.usuario'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Progreso> {
    const p = await this.progresoRepo.findOne({
      where: { id_progreso: id },
      relations: ['socio', 'socio.usuario'],
    });
    if (!p) throw new NotFoundException(`Registro de progreso con id ${id} no encontrado`);
    return p;
  }

  findBySocio(idSocio: number): Promise<Progreso[]> {
    return this.progresoRepo.find({
      where: { socio: { id_socio: idSocio } },
      order: { fecha: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateProgresoDto): Promise<Progreso> {
    const p = await this.findOne(id);
    if (dto.peso !== undefined) p.peso = dto.peso ?? null;
    if (dto.observaciones !== undefined) p.observaciones = dto.observaciones ?? null;
    if (dto.fecha !== undefined) p.fecha = dto.fecha;
    return this.progresoRepo.save(p);
  }

  async remove(id: number): Promise<void> {
    const p = await this.findOne(id);
    await this.progresoRepo.remove(p);
  }
}
