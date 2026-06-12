import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { RutinaEjercicio } from '../../rutinas/entities/rutina-ejercicio.entity';

@Entity('ejercicio')
export class Ejercicio {
  @PrimaryGeneratedColumn({ name: 'id_ejercicio' })
  id_ejercicio!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  @IsNotEmpty({ message: 'El nombre del ejercicio es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  descripcion!: string | null;

  @Column({
    name: 'grupo_muscular',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  grupo_muscular!: string | null;

  @OneToMany(() => RutinaEjercicio, (re) => re.ejercicio)
  rutina_ejercicios!: RutinaEjercicio[];
}
