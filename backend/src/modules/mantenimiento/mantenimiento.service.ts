import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mantenimiento } from './entities/mantenimiento.entity';
import { Equipo } from '../equipos/entities/equipo.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import {
  CreateMantenimientoDto,
  UpdateMantenimientoDto,
} from './dto/mantenimiento.dto';

@Injectable()
export class MantenimientoService {
  constructor(
    @InjectRepository(Mantenimiento)
    private readonly mantenimientoRepo: Repository<Mantenimiento>,
    @InjectRepository(Equipo)
    private readonly equipoRepo: Repository<Equipo>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreateMantenimientoDto): Promise<Mantenimiento> {
    const equipo = await this.equipoRepo.findOne({
      where: { id_equipo: dto.id_equipo },
    });
    if (!equipo)
      throw new NotFoundException(
        `Equipo con id ${dto.id_equipo} no encontrado`,
      );

    let usuario: Usuario | null = null;
    if (dto.id_usuario) {
      usuario = await this.usuarioRepo.findOne({
        where: { id_usuario: dto.id_usuario },
      });
      if (!usuario)
        throw new NotFoundException(
          `Usuario con id ${dto.id_usuario} no encontrado`,
        );
    }

    const mantenimiento = this.mantenimientoRepo.create({
      equipo,
      usuario,
      fecha: dto.fecha,
      descripcion: dto.descripcion ?? null,
    });
    return this.mantenimientoRepo.save(mantenimiento);
  }

  findAll(): Promise<Mantenimiento[]> {
    return this.mantenimientoRepo.find({
      relations: ['equipo', 'usuario'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Mantenimiento> {
    const m = await this.mantenimientoRepo.findOne({
      where: { id_mantenimiento: id },
      relations: ['equipo', 'usuario'],
    });
    if (!m)
      throw new NotFoundException(`Mantenimiento con id ${id} no encontrado`);
    return m;
  }

  findByEquipo(idEquipo: number): Promise<Mantenimiento[]> {
    return this.mantenimientoRepo.find({
      where: { equipo: { id_equipo: idEquipo } },
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    });
  }

  async update(
    id: number,
    dto: UpdateMantenimientoDto,
  ): Promise<Mantenimiento> {
    const m = await this.findOne(id);
    if (dto.fecha !== undefined) m.fecha = dto.fecha;
    if (dto.descripcion !== undefined) m.descripcion = dto.descripcion ?? null;
    if (dto.id_equipo !== undefined) {
      const equipo = await this.equipoRepo.findOne({
        where: { id_equipo: dto.id_equipo },
      });
      if (!equipo)
        throw new NotFoundException(
          `Equipo con id ${dto.id_equipo} no encontrado`,
        );
      m.equipo = equipo;
    }
    if (dto.id_usuario !== undefined) {
      if (dto.id_usuario === null) {
        m.usuario = null;
      } else {
        const usuario = await this.usuarioRepo.findOne({
          where: { id_usuario: dto.id_usuario },
        });
        if (!usuario)
          throw new NotFoundException(
            `Usuario con id ${dto.id_usuario} no encontrado`,
          );
        m.usuario = usuario;
      }
    }
    return this.mantenimientoRepo.save(m);
  }

  async remove(id: number): Promise<void> {
    const m = await this.findOne(id);
    await this.mantenimientoRepo.remove(m);
  }
}
