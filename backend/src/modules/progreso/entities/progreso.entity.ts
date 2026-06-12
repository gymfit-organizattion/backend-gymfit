import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Socio } from '../../socios/entities/socio.entity';

@Entity('progreso')
export class Progreso {
  @PrimaryGeneratedColumn({ name: 'id_progreso' })
  id_progreso!: number;

  @Column({
    name: 'peso',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsPositive({ message: 'El peso debe ser mayor a 0' })
  peso!: number | null;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  observaciones!: string | null;

  @Column({ name: 'fecha', type: 'date' })
  @IsNotEmpty({ message: 'La fecha del progreso es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha debe tener formato válido (YYYY-MM-DD)' },
  )
  fecha!: string;

  @ManyToOne(() => Socio, (s) => s.progresos, { nullable: false })
  @JoinColumn({ name: 'id_socio' })
  socio!: Socio;
}
