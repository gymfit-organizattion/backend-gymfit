import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluacion } from './entities/evaluacion.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Entrenador } from '../entrenadores/entities/entrenador.entity';
import { Asignacion } from '../entrenadores/entities/asignacion.entity';
import { CreateEvaluacionDto, UpdateEvaluacionDto } from './dto/evaluacion.dto';

@Injectable()
export class EvaluacionesService {
  constructor(
    @InjectRepository(Evaluacion)
    private readonly evaluacionRepo: Repository<Evaluacion>,
    @InjectRepository(Socio)
    private readonly socioRepo: Repository<Socio>,
    @InjectRepository(Entrenador)
    private readonly entrenadorRepo: Repository<Entrenador>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
  ) {}

  async create(
    dto: CreateEvaluacionDto,
    idUsuario: number,
    esAdmin: boolean,
  ): Promise<Evaluacion> {
    const socio = await this.socioRepo.findOne({
      where: { id_socio: dto.id_socio },
    });
    if (!socio)
      throw new NotFoundException(`Socio con id ${dto.id_socio} no encontrado`);

    if (!esAdmin) {
      const asignado = await this.asignacionRepo.findOne({
        where: {
          socio: { id_socio: dto.id_socio },
          entrenador: { usuario: { id_usuario: idUsuario } },
        },
      });
      if (!asignado) {
        throw new ForbiddenException(
          'No tienes permiso para evaluar a este socio. No estás asignado como su entrenador.',
        );
      }
    }

    const evaluacion = this.evaluacionRepo.create({
      socio,
      peso: dto.peso,
      grasa: dto.grasa ?? null,
      medidas: dto.medidas ?? null,
      fecha: dto.fecha,
    });
    return this.evaluacionRepo.save(evaluacion);
  }

  findAll(): Promise<Evaluacion[]> {
    return this.evaluacionRepo.find({
      relations: ['socio', 'socio.usuario'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Evaluacion> {
    const e = await this.evaluacionRepo.findOne({
      where: { id_evaluacion: id },
      relations: ['socio', 'socio.usuario'],
    });
    if (!e)
      throw new NotFoundException(`Evaluación con id ${id} no encontrada`);
    return e;
  }

  findBySocio(idSocio: number): Promise<Evaluacion[]> {
    return this.evaluacionRepo.find({
      where: { socio: { id_socio: idSocio } },
      order: { fecha: 'DESC' },
    });
  }

  async update(
    id: number,
    dto: UpdateEvaluacionDto,
    idUsuario: number,
    esAdmin: boolean,
  ): Promise<Evaluacion> {
    const e = await this.findOne(id);

    if (!esAdmin) {
      const asignado = await this.asignacionRepo.findOne({
        where: {
          socio: { id_socio: e.socio.id_socio },
          entrenador: { usuario: { id_usuario: idUsuario } },
        },
      });
      if (!asignado) {
        throw new ForbiddenException(
          'No tienes permiso para actualizar esta evaluación. No eres el entrenador asignado a este socio.',
        );
      }
    }

    if (dto.peso !== undefined) e.peso = dto.peso;
    if (dto.grasa !== undefined) e.grasa = dto.grasa ?? null;
    if (dto.medidas !== undefined) e.medidas = dto.medidas ?? null;
    if (dto.fecha !== undefined) e.fecha = dto.fecha;
    return this.evaluacionRepo.save(e);
  }

  async remove(id: number): Promise<void> {
    const e = await this.findOne(id);
    await this.evaluacionRepo.remove(e);
  }
}
