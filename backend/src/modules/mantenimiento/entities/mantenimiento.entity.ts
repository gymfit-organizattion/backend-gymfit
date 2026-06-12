import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Equipo } from '../../equipos/entities/equipo.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('mantenimiento')
export class Mantenimiento {
  @PrimaryGeneratedColumn({ name: 'id_mantenimiento' })
  id_mantenimiento!: number;

  @Column({ name: 'fecha', type: 'date' })
  @IsNotEmpty({ message: 'La fecha del mantenimiento es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha debe tener formato válido (YYYY-MM-DD)' },
  )
  fecha!: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  descripcion!: string | null;

  @ManyToOne(() => Equipo, (e) => e.mantenimientos, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'id_equipo' })
  equipo!: Equipo;

  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario | null;
}
