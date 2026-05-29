import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { AlertaStock } from '../../alertas-stock/entities/alerta-stock.entity';
import { Mantenimiento } from '../../mantenimiento/entities/mantenimiento.entity';

@Entity('equipo')
export class Equipo {
  @PrimaryGeneratedColumn({ name: 'id_equipo' })
  id_equipo!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ name: 'codigo_barras', type: 'varchar', length: 100, nullable: true, unique: true })
  codigo_barras!: string | null;

  @Column({ name: 'tipo', type: 'varchar', length: 50, nullable: true })
  tipo!: string | null;

  @Column({ name: 'estado', type: 'varchar', length: 50, default: 'disponible' })
  estado!: string;

  @Column({ name: 'ubicacion', type: 'varchar', length: 100, nullable: true })
  ubicacion!: string | null;

  @Column({ name: 'cantidad', type: 'int', default: 0 })
  cantidad!: number;

  @Column({ name: 'stock_minimo', type: 'int', default: 5 })
  stock_minimo!: number;

  @Column({ name: 'stock_maximo', type: 'int', nullable: true })
  stock_maximo!: number | null;

  @Column({ name: 'precio_unitario', type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio_unitario!: number | null;

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion!: Date;

  @OneToMany(() => Mantenimiento, (m) => m.equipo)
  mantenimientos!: Mantenimiento[];

  @OneToMany(() => AlertaStock, (a) => a.equipo)
  alertas_stock!: AlertaStock[];
}
