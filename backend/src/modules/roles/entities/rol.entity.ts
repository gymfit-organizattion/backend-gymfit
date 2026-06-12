import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn({ name: 'id_rol' })
  id_rol!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 50, unique: true })
  nombre!: string;

  //  Relaciones
  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios!: Usuario[];
}
