import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Rutina } from './rutina.entity';
import { Ejercicio } from '../../ejercicios/entities/ejercicio.entity';

/**
 * Tabla intermedia: rutina_ejercicio
 * Registra los ejercicios de una rutina con sus atributos de carga.
 * RF-011: series, repeticiones, descanso, observaciones técnicas.
 */
@Entity('rutina_ejercicio')
export class RutinaEjercicio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'series', type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  series!: number | null;

  @Column({ name: 'repeticiones', type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  repeticiones!: number | null;

  @Column({
    name: 'descanso',
    type: 'integer',
    nullable: true,
    comment: 'Descanso en segundos',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  descanso!: number | null;

  @Column({
    name: 'observaciones',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Observaciones técnicas / indicaciones del entrenador',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones!: string | null;

  // ─── Relaciones ───────────────────────────────────────────────────────────

  @ManyToOne(() => Rutina, (r) => r.rutina_ejercicios, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_rutina' })
  rutina!: Rutina;

  @ManyToOne(() => Ejercicio, (e) => e.rutina_ejercicios, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'id_ejercicio' })
  ejercicio!: Ejercicio;
}
