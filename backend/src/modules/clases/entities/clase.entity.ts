import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsPositive,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { Entrenador } from '../../entrenadores/entities/entrenador.entity';
import { Inscripcion } from '../../inscripciones/entities/inscripcion.entity';

@Entity('clase')
export class Clase {
  @PrimaryGeneratedColumn({ name: 'id_clase' })
  id_clase!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  @IsNotEmpty({ message: 'El nombre de la clase es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @Column({ name: 'horario', type: 'timestamp without time zone' })
  @IsNotEmpty({ message: 'El horario es obligatorio' })
  horario!: Date;

  @Column({ name: 'cupo', type: 'integer' })
  @IsNotEmpty({ message: 'El cupo es obligatorio' })
  @IsInt()
  @Min(1, { message: 'El cupo debe ser mayor a 0' })
  cupo!: number;

  @ManyToOne(() => Entrenador, (e) => e.clases, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'id_entrenador' })
  entrenador!: Entrenador;

  @OneToMany(() => Inscripcion, (i) => i.clase)
  inscripciones!: Inscripcion[];
}
