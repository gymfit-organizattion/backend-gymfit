import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rol } from '../../roles/entities/rol.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id_usuario!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ name: 'identificacion', type: 'varchar', length: 50, unique: true })
  identificacion!: string;

  @Column({ name: 'correo', type: 'varchar', length: 100, unique: true })
  correo!: string;

  @Column({ name: 'password', type: 'text' })
  password!: string;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: true })
  telefono!: string | null;

  @Column({ name: 'estado', type: 'boolean', default: true })
  estado!: boolean;

  @Column({ name: 'intentos_fallidos', type: 'int', default: 0 })
  intentos_fallidos!: number;

  @Column({ name: 'bloqueado_hasta', type: 'timestamp', nullable: true })
  bloqueado_hasta!: Date | null;

  //  Relaciones
  @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_rol' })
  rol!: Rol;
}
