import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ejercicio } from './entities/ejercicio.entity';
import { CreateEjercicioDto, UpdateEjercicioDto } from './dto/ejercicio.dto';

@Injectable()
export class EjerciciosService implements OnModuleInit {
  constructor(
    @InjectRepository(Ejercicio)
    private readonly ejercicioRepo: Repository<Ejercicio>,
  ) {}

  async onModuleInit() {
    try {
      // 1. Migrar y alinear registros existentes en la base de datos con los nombres de filtro de la interfaz (UI)
      await this.ejercicioRepo
        .createQueryBuilder()
        .update(Ejercicio)
        .set({ grupo_muscular: 'Cuádriceps' })
        .where('grupo_muscular = :gm', { gm: 'Piernas' })
        .execute();

      await this.ejercicioRepo
        .createQueryBuilder()
        .update(Ejercicio)
        .set({ grupo_muscular: 'Bíceps' })
        .where('grupo_muscular = :gm', { gm: 'Brazos' })
        .execute();

      await this.ejercicioRepo
        .createQueryBuilder()
        .update(Ejercicio)
        .set({ grupo_muscular: 'Abdomen' })
        .where('grupo_muscular = :gm', { gm: 'Core' })
        .execute();

      // 2. Sembrar únicamente los ejercicios faltantes para evitar conflictos de llaves foráneas en cascada
      const existing = await this.ejercicioRepo.find();
      const existingNames = new Set(
        existing.map((e) => e.nombre.trim().toLowerCase()),
      );

      const defaultEjercicios = [
        // Pectorales (Pecho)
        {
          nombre: 'Press de Banca',
          descripcion: 'Ejercicios clásico de empuje con barra para pectorales',
          grupo_muscular: 'Pecho',
        },
        {
          nombre: 'Flexiones de Pecho',
          descripcion: 'Flexoextensiones de brazos en suelo con peso corporal',
          grupo_muscular: 'Pecho',
        },

        // Espalda
        {
          nombre: 'Peso Muerto con Barra',
          descripcion:
            'Levantamiento de barra desde el suelo enfocado en cadena posterior',
          grupo_muscular: 'Espalda',
        },
        {
          nombre: 'Jalón al Pecho',
          descripcion: 'Tirón vertical en polea alta para dorsales',
          grupo_muscular: 'Espalda',
        },

        // Hombros
        {
          nombre: 'Press Militar con Barra',
          descripcion: 'Empuje vertical por encima de la cabeza para deltoides',
          grupo_muscular: 'Hombros',
        },

        // Bíceps
        {
          nombre: 'Curl de Bíceps con Mancuernas',
          descripcion: 'Flexión de codos alternada con mancuernas',
          grupo_muscular: 'Bíceps',
        },

        // Tríceps
        {
          nombre: 'Extensión de Tríceps en Polea',
          descripcion:
            'Extensión de codos hacia abajo en polea alta con cuerda',
          grupo_muscular: 'Tríceps',
        },

        // Abdomen
        {
          nombre: 'Abdominales Crunches',
          descripcion: 'Flexión de tronco en suelo para recto abdominal',
          grupo_muscular: 'Abdomen',
        },
        {
          nombre: 'Plancha Anaeróbica',
          descripcion: 'Sostén isométrico apoyado en antebrazos en suelo',
          grupo_muscular: 'Abdomen',
        },

        // Cuádriceps
        {
          nombre: 'Sentadillas con Barra',
          descripcion: 'Sentadillas profundas con barra olímpica',
          grupo_muscular: 'Cuádriceps',
        },
        {
          nombre: 'Zancadas con Mancuernas',
          descripcion: 'Desplantes alternados de piernas con peso libre',
          grupo_muscular: 'Cuádriceps',
        },

        // Isquiotibiales
        {
          nombre: 'Peso Muerto Rumano',
          descripcion:
            'Peso muerto con barra enfocado en estiramiento de femorales',
          grupo_muscular: 'Isquiotibiales',
        },

        // Glúteos
        {
          nombre: 'Hip Thrust con Barra',
          descripcion:
            'Empuje de cadera con barra apoyado en banco enfocado en glúteos',
          grupo_muscular: 'Glúteos',
        },

        // Pantorrillas
        {
          nombre: 'Elevación de Talones',
          descripcion: 'Elevaciones de talones de pie para trabajo de gemelos',
          grupo_muscular: 'Pantorrillas',
        },

        // Cardio
        {
          nombre: 'Trotadora Eléctrica',
          descripcion:
            'Cinta de correr para entrenamiento cardiovascular de resistencia',
          grupo_muscular: 'Cardio',
        },

        // Otro
        {
          nombre: 'Burpees Completos',
          descripcion: 'Ejercicio metabólico multiarticular de cuerpo completo',
          grupo_muscular: 'Otro',
        },
      ];

      // Filtrar e insertar solo los que no existen
      const missingEjercicios = defaultEjercicios.filter(
        (d) => !existingNames.has(d.nombre.trim().toLowerCase()),
      );

      if (missingEjercicios.length > 0) {
        await this.ejercicioRepo.save(
          this.ejercicioRepo.create(missingEjercicios),
        );
        console.log(
          `🌱 GymFit: ¡Se sembraron ${missingEjercicios.length} ejercicios nuevos/faltantes en el catálogo de forma segura!`,
        );
      } else {
        console.log(
          '🌱 GymFit: El catálogo ya cuenta con todos los ejercicios de referencia.',
        );
      }
    } catch (error) {
      console.error(
        '❌ GymFit: Error al sembrar/alinear catálogo de ejercicios:',
        error,
      );
    }
  }

  create(dto: CreateEjercicioDto): Promise<Ejercicio> {
    return this.ejercicioRepo.save(this.ejercicioRepo.create(dto));
  }

  findAll(): Promise<Ejercicio[]> {
    return this.ejercicioRepo.find({ order: { id_ejercicio: 'ASC' } });
  }

  async findOne(id: number): Promise<Ejercicio> {
    const e = await this.ejercicioRepo.findOne({ where: { id_ejercicio: id } });
    if (!e) throw new NotFoundException(`Ejercicio con id ${id} no encontrado`);
    return e;
  }

  async update(id: number, dto: UpdateEjercicioDto): Promise<Ejercicio> {
    const e = await this.findOne(id);
    Object.assign(e, dto);
    return this.ejercicioRepo.save(e);
  }

  async remove(id: number): Promise<void> {
    const e = await this.findOne(id);
    await this.ejercicioRepo.remove(e);
  }
}
