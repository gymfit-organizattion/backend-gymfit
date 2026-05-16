import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('prospecto')
export class Prospecto {
  @PrimaryGeneratedColumn({ name: 'id_prospecto' })
  id_prospecto!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: true })
  telefono!: string | null;

  @Column({ name: 'interes', type: 'varchar', length: 100, nullable: true })
  interes!: string | null;

  @Column({ name: 'origen', type: 'varchar', length: 30, nullable: true })
  origen!: string | null;

  @Column({ name: 'estado', type: 'varchar', length: 30, default: 'Pendiente' })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamptz' })
  fecha_registro!: Date;
}
