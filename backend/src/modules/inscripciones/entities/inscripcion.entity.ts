import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Socio } from '../../socios/entities/socio.entity';
import { Clase } from '../../clases/entities/clase.entity';

@Entity('inscripcion')
export class Inscripcion {
  @PrimaryGeneratedColumn({ name: 'id_inscripcion' })
  id_inscripcion!: number;

  @CreateDateColumn({
    name: 'fecha_inscripcion',
    type: 'timestamp without time zone',
  })
  fecha_inscripcion!: Date;

  @ManyToOne(() => Socio, (s) => s.inscripciones, { nullable: false })
  @JoinColumn({ name: 'id_socio' })
  socio!: Socio;

  @ManyToOne(() => Clase, (c) => c.inscripciones, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'id_clase' })
  clase!: Clase;
}
