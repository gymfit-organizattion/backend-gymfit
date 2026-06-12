import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Equipo } from '../../equipos/entities/equipo.entity';

@Entity('alerta_stock')
export class AlertaStock {
  @PrimaryGeneratedColumn({ name: 'id_alerta' })
  id_alerta!: number;

  @ManyToOne(() => Equipo, (equipo) => equipo.alertas_stock, { eager: true })
  @JoinColumn({ name: 'id_equipo' })
  equipo!: Equipo;

  @Column({
    name: 'tipo',
    type: 'enum',
    enum: ['bajo_stock', 'sobre_stock', 'agotado'],
  })
  tipo!: 'bajo_stock' | 'sobre_stock' | 'agotado';

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ name: 'estado', type: 'varchar', length: 50, default: 'activa' })
  estado!: string; // activa, resuelta, ignorada

  @Column({ name: 'cantidad_actual', type: 'int' })
  cantidad_actual!: number;

  @Column({ name: 'cantidad_esperada', type: 'int' })
  cantidad_esperada!: number;

  @Column({ name: 'diferencia', type: 'int' })
  diferencia!: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;

  @UpdateDateColumn({ name: 'fecha_resolucion' })
  fecha_resolucion!: Date;
}
