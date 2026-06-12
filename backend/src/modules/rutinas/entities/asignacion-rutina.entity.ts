import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsDateString } from 'class-validator';
import { Rutina } from './rutina.entity';
import { Socio } from '../../socios/entities/socio.entity';

/**
 * Tabla: asignacion_rutina
 * Registra qué rutina está asignada a qué socio y en qué fecha se hizo la asignación.
 * Relación: rutina (N) y socio (N) con fecha.
 */
@Entity('asignacion_rutina')
export class AsignacionRutina {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'fecha_asignacion', type: 'date' })
  @IsNotEmpty({ message: 'La fecha de asignación es obligatoria' })
  @IsDateString()
  fecha_asignacion!: string;

  @ManyToOne(() => Rutina, (r) => r.asignaciones, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'id_rutina' })
  rutina!: Rutina;

  @ManyToOne(() => Socio, (s) => s.asignaciones_rutina, { nullable: false })
  @JoinColumn({ name: 'id_socio' })
  socio!: Socio;
}
