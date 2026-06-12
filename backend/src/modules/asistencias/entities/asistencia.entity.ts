import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Socio } from '../../socios/entities/socio.entity';

@Entity('asistencia')
export class Asistencia {
  @PrimaryGeneratedColumn({ name: 'id_asistencia' })
  id_asistencia!: number;

  @CreateDateColumn({
    name: 'fecha',
    type: 'timestamp without time zone',
  })
  fecha!: Date;

  @ManyToOne(() => Socio, (s) => s.asistencias, { nullable: false })
  @JoinColumn({ name: 'id_socio' })
  socio!: Socio;
}
