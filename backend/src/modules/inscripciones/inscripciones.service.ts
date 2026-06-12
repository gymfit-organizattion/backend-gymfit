import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscripcion } from './entities/inscripcion.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Clase } from '../clases/entities/clase.entity';
import { CreateInscripcionDto } from './dto/inscripcion.dto';

@Injectable()
export class InscripcionesService {
  constructor(
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(Socio)
    private readonly socioRepo: Repository<Socio>,
    @InjectRepository(Clase)
    private readonly claseRepo: Repository<Clase>,
  ) {}

  async create(dto: CreateInscripcionDto): Promise<Inscripcion> {
    // Verificar socio
    const socio = await this.socioRepo.findOne({
      where: { id_socio: dto.id_socio },
    });
    if (!socio)
      throw new NotFoundException(`Socio con id ${dto.id_socio} no encontrado`);

    // Verificar clase y cupos
    const clase = await this.claseRepo.findOne({
      where: { id_clase: dto.id_clase },
      relations: ['inscripciones'],
    });
    if (!clase)
      throw new NotFoundException(`Clase con id ${dto.id_clase} no encontrada`);

    const inscritos = clase.inscripciones?.length ?? 0;
    if (inscritos >= clase.cupo)
      throw new BadRequestException('No hay cupos disponibles en esta clase');

    // Verificar inscripción duplicada
    const yaInscrito = await this.inscripcionRepo.findOne({
      where: {
        socio: { id_socio: dto.id_socio },
        clase: { id_clase: dto.id_clase },
      },
    });
    if (yaInscrito)
      throw new ConflictException('El socio ya está inscrito en esta clase');

    const inscripcion = this.inscripcionRepo.create({ socio, clase });
    return this.inscripcionRepo.save(inscripcion);
  }

  findAll(): Promise<Inscripcion[]> {
    return this.inscripcionRepo.find({
      relations: [
        'socio',
        'socio.usuario',
        'clase',
        'clase.entrenador',
        'clase.entrenador.usuario',
      ],
      order: { id_inscripcion: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Inscripcion> {
    const i = await this.inscripcionRepo.findOne({
      where: { id_inscripcion: id },
      relations: ['socio', 'socio.usuario', 'clase'],
    });
    if (!i)
      throw new NotFoundException(`Inscripción con id ${id} no encontrada`);
    return i;
  }

  findBySocio(idSocio: number): Promise<Inscripcion[]> {
    return this.inscripcionRepo.find({
      where: { socio: { id_socio: idSocio } },
      relations: ['clase', 'clase.entrenador', 'clase.entrenador.usuario'],
      order: { fecha_inscripcion: 'DESC' },
    });
  }

  findByClase(idClase: number): Promise<Inscripcion[]> {
    return this.inscripcionRepo.find({
      where: { clase: { id_clase: idClase } },
      relations: ['socio', 'socio.usuario'],
      order: { fecha_inscripcion: 'ASC' },
    });
  }

  async remove(id: number): Promise<void> {
    const i = await this.inscripcionRepo.findOne({
      where: { id_inscripcion: id },
    });
    if (!i)
      throw new NotFoundException(`Inscripción con id ${id} no encontrada`);
    await this.inscripcionRepo.remove(i);
  }
}
