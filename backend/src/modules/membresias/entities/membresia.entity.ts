import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsNotEmpty,
  IsDateString,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Socio } from '../../socios/entities/socio.entity';
import { Plan } from '../../planes/entities/plan.entity';

@Entity('membresia')
export class Membresia {
  @PrimaryGeneratedColumn({ name: 'id_membresia' })
  id_membresia!: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @IsDateString({}, { message: 'La fecha de inicio debe tener formato válido' })
  fecha_inicio!: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  @IsDateString({}, { message: 'La fecha de fin debe tener formato válido' })
  fecha_fin!: string;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'activa' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  estado!: string;

  @ManyToOne(() => Socio, (s) => s.membresias, { nullable: false })
  @JoinColumn({ name: 'id_socio' })
  socio!: Socio;

  @ManyToOne(() => Plan, (p) => p.membresias, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_plan' })
  plan!: Plan;
}
