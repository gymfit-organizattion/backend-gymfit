import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsDateString } from 'class-validator';
import { Entrenador } from './entrenador.entity';
import { Socio } from '../../socios/entities/socio.entity';

/**
 * Tabla: asignacion
 * Representa la asignación de un entrenador a un socio.
 * Relación: entrenador (N) y socio (N) con fecha.
 */
@Entity('asignacion')
export class Asignacion {
  @PrimaryGeneratedColumn({ name: 'id_asignacion' })
  id_asignacion!: number;

  @Column({ name: 'fecha_asignacion', type: 'date' })
  @IsNotEmpty({ message: 'La fecha de asignación es obligatoria' })
  fecha_asignacion!: string;

  @ManyToOne(() => Entrenador, (e) => e.asignaciones, { nullable: false })
  @JoinColumn({ name: 'id_entrenador' })
  entrenador!: Entrenador;

  @ManyToOne(() => Socio, (s) => s.asignaciones_entrenador, { nullable: false })
  @JoinColumn({ name: 'id_socio' })
  socio!: Socio;
}
