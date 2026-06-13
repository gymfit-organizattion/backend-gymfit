import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('codigos_participante')
export class CodigoParticipante {
  @PrimaryGeneratedColumn()
  id_codigo: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  codigo: string;

  @Column({ type: 'boolean', default: false })
  usado: boolean;

  @CreateDateColumn()
  fecha_generacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_uso: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_usuario_generador' })
  generador: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_usuario_registrado' })
  usuario_registrado: Usuario;
}
