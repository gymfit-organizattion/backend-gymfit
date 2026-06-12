import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clase } from './entities/clase.entity';
import { Entrenador } from '../entrenadores/entities/entrenador.entity';
import { CreateClaseDto } from './dto/clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';

@Injectable()
export class ClasesService {
  constructor(
    @InjectRepository(Clase)
    private readonly claseRepo: Repository<Clase>,
    @InjectRepository(Entrenador)
    private readonly entrenadorRepo: Repository<Entrenador>,
  ) {}

  async create(dto: CreateClaseDto): Promise<Clase> {
    const entrenador = await this.entrenadorRepo.findOne({
      where: { id_entrenador: dto.id_entrenador },
    });
    if (!entrenador)
      throw new NotFoundException(
        `Entrenador con id ${dto.id_entrenador} no encontrado`,
      );
    const clase = this.claseRepo.create({ ...dto, entrenador });
    return this.claseRepo.save(clase);
  }

  findAll(): Promise<Clase[]> {
    return this.claseRepo.find({
      relations: ['entrenador', 'entrenador.usuario', 'inscripciones'],
      order: { id_clase: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Clase> {
    const c = await this.claseRepo.findOne({
      where: { id_clase: id },
      relations: [
        'entrenador',
        'entrenador.usuario',
        'inscripciones',
        'inscripciones.socio',
        'inscripciones.socio.usuario',
      ],
    });
    if (!c) throw new NotFoundException(`Clase con id ${id} no encontrada`);
    return c;
  }

  async update(id: number, dto: UpdateClaseDto): Promise<Clase> {
    const c = await this.claseRepo.findOne({
      where: { id_clase: id },
      relations: ['entrenador'],
    });
    if (!c) throw new NotFoundException(`Clase con id ${id} no encontrada`);
    if (dto.id_entrenador) {
      const entrenador = await this.entrenadorRepo.findOne({
        where: { id_entrenador: dto.id_entrenador },
      });
      if (!entrenador)
        throw new NotFoundException(
          `Entrenador con id ${dto.id_entrenador} no encontrado`,
        );
      c.entrenador = entrenador;
    }
    if (dto.nombre !== undefined) c.nombre = dto.nombre;
    if (dto.horario !== undefined) c.horario = dto.horario;
    if (dto.cupo !== undefined) c.cupo = dto.cupo;
    return this.claseRepo.save(c);
  }

  async remove(id: number): Promise<void> {
    const c = await this.claseRepo.findOne({ where: { id_clase: id } });
    if (!c) throw new NotFoundException(`Clase con id ${id} no encontrada`);
    await this.claseRepo.remove(c);
  }

  async getCuposDisponibles(
    id: number,
  ): Promise<{ cupo_total: number; inscritos: number; disponibles: number }> {
    const c = await this.claseRepo.findOne({
      where: { id_clase: id },
      relations: ['inscripciones'],
    });
    if (!c) throw new NotFoundException(`Clase con id ${id} no encontrada`);
    const inscritos = c.inscripciones?.length ?? 0;
    return { cupo_total: c.cupo, inscritos, disponibles: c.cupo - inscritos };
  }
}
