import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  IsPositive,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { Membresia } from '../../membresias/entities/membresia.entity';

@Entity('plan')
export class Plan {
  @PrimaryGeneratedColumn({ name: 'id_plan' })
  id_plan!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  @IsNotEmpty({ message: 'El nombre del plan es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @Column({ name: 'precio', type: 'numeric', precision: 10, scale: 2 })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  precio!: number;

  @Column({ name: 'descripcion', type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion!: string | null;

  @Column({ name: 'duracion_meses', type: 'integer' })
  @IsNotEmpty({ message: 'La duración en meses es obligatoria' })
  @IsInt()
  @Min(1, { message: 'La duración debe ser al menos 1 mes' })
  duracion_meses!: number;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;

  @OneToMany(() => Membresia, (m) => m.plan)
  membresias!: Membresia[];
}
