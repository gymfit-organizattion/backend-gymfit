import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('notificacion')
export class Notificacion {
  @PrimaryGeneratedColumn({ name: 'id_notificacion' })
  id_notificacion!: number;

  /**
   * Relación opcional con usuario destinatario.
   * Si es null, la notificación es global (visible para todos los admins).
   * Se usa @JoinColumn con referencedColumnName para mapear id_usuario
   * como FK sin declarar un @Column separado (evita conflicto de mapeo).
   */
  @ManyToOne(() => Usuario, {
    nullable: true,
    eager: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario | null;

  // Columna virtual para leer el FK sin cargar la relación completa
  @Column({
    name: 'id_usuario',
    type: 'int',
    nullable: true,
    insert: false,
    update: false,
  })
  id_usuario!: number | null;

  @Column({ name: 'tipo', type: 'varchar', length: 50 })
  // Ejemplos: 'membresia_por_vencer', 'stock_bajo', 'mantenimiento', 'sistema'
  tipo!: string;

  @Column({ name: 'titulo', type: 'varchar', length: 150 })
  titulo!: string;

  @Column({ name: 'mensaje', type: 'text' })
  mensaje!: string;

  @Column({ name: 'leida', type: 'boolean', default: false })
  leida!: boolean;

  @Column({ name: 'referencia_id', type: 'int', nullable: true })
  // ID del recurso relacionado (id_equipo, id_membresia, etc.)
  referencia_id!: number | null;

  @Column({
    name: 'referencia_tipo',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  // Tipo del recurso: 'equipo', 'membresia', 'socio', etc.
  referencia_tipo!: string | null;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;
}
