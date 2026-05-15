import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { RutinaEjercicio } from './rutina-ejercicio.entity';
import { AsignacionRutina } from './asignacion-rutina.entity';

@Entity('rutina')
export class Rutina {
  @PrimaryGeneratedColumn({ name: 'id_rutina' })
  id_rutina!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  @IsNotEmpty({ message: 'El nombre de la rutina es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  descripcion!: string | null;

  @Column({ name: 'nivel', type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nivel!: string | null;

  @Column({ name: 'objetivo', type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  objetivo!: string | null;

  
  @OneToMany(() => RutinaEjercicio, (re) => re.rutina, { cascade: true })
  rutina_ejercicios!: RutinaEjercicio[];

  @OneToMany(() => AsignacionRutina, (ar) => ar.rutina)
  asignaciones!: AsignacionRutina[];
}
