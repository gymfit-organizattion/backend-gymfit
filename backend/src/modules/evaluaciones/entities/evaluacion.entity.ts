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

@Entity('evaluacion')
export class Evaluacion {
  @PrimaryGeneratedColumn({ name: 'id_evaluacion' })
  id_evaluacion!: number;

  @Column({ name: 'peso', type: 'numeric', precision: 5, scale: 2 })
  @IsNotEmpty({ message: 'El peso es obligatorio' })
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsPositive({ message: 'El peso debe ser mayor a 0' })
  peso!: number;

  @Column({
    name: 'grasa',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  grasa!: number | null;

  @Column({
    name: 'medidas',
    type: 'text',
    nullable: true,
    comment: 'JSON con medidas corporales',
  })
  @IsOptional()
  @IsString()
  medidas!: string | null;

  @Column({ name: 'fecha', type: 'date' })
  @IsNotEmpty({ message: 'La fecha de evaluación es obligatoria' })
  @IsDateString()
  fecha!: string;

  @ManyToOne(() => Socio, (s) => s.evaluaciones, { nullable: false })
  @JoinColumn({ name: 'id_socio' })
  socio!: Socio;
}
