import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Prospecto } from '../../prospectos/entities/prospecto.entity';
import { Membresia } from '../../membresias/entities/membresia.entity';
import { Inscripcion } from '../../inscripciones/entities/inscripcion.entity';
import { Evaluacion } from '../../evaluaciones/entities/evaluacion.entity';
import { Progreso } from '../../progreso/entities/progreso.entity';
import { Asistencia } from '../../asistencias/entities/asistencia.entity';
import { AsignacionRutina } from '../../rutinas/entities/asignacion-rutina.entity';
import { Asignacion } from '../../entrenadores/entities/asignacion.entity';

@Entity('socio')
export class Socio {
  @PrimaryGeneratedColumn({ name: 'id_socio' })
  id_socio!: number;

  @Column({ name: 'direccion', type: 'varchar', length: 150, nullable: true })
  direccion!: string | null;

  @Column({ name: 'datos_salud', type: 'text', nullable: true })
  datos_salud!: string | null;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamptz' })
  fecha_registro!: Date;

  // ─── Relaciones ────────────────────────────────────────────
  @ManyToOne(() => Usuario, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @ManyToOne(() => Prospecto, { nullable: true, eager: false })
  @JoinColumn({ name: 'id_prospecto' })
  prospecto!: Prospecto | null;

  @OneToMany(() => Membresia, (m) => m.socio)
  membresias!: Membresia[];

  @OneToMany(() => Inscripcion, (i) => i.socio)
  inscripciones!: Inscripcion[];

  @OneToMany(() => Evaluacion, (e) => e.socio)
  evaluaciones!: Evaluacion[];

  @OneToMany(() => Progreso, (p) => p.socio)
  progresos!: Progreso[];

  @OneToMany(() => Asistencia, (a) => a.socio)
  asistencias!: Asistencia[];

  @OneToMany(() => AsignacionRutina, (ar) => ar.socio)
  asignaciones_rutina!: AsignacionRutina[];

  @OneToMany(() => Asignacion, (a) => a.socio)
  asignaciones_entrenador!: Asignacion[];
}
