import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEquipoDto, UpdateEquipoDto } from './dto/equipo.dto';
import { Equipo } from './entities/equipo.entity';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo)
    private readonly equipoRepo: Repository<Equipo>,
  ) {}

  create(dto: CreateEquipoDto): Promise<Equipo> {
    const equipo = this.equipoRepo.create({
      nombre: dto.nombre,
      codigo_barras: dto.codigo_barras ?? null,
      tipo: dto.tipo ?? null,
      estado: dto.estado ?? 'disponible',
      ubicacion: dto.ubicacion ?? null,
      cantidad: dto.cantidad ?? 0,
      stock_minimo: dto.stock_minimo ?? 5,
      stock_maximo: dto.stock_maximo ?? null,
      precio_unitario: dto.precio_unitario ?? null,
    });
    return this.equipoRepo.save(equipo);
  }

  findAll(): Promise<Equipo[]> {
    return this.equipoRepo.find({
      relations: ['mantenimientos', 'alertas_stock'],
      order: { id_equipo: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Equipo> {
    const e = await this.equipoRepo.findOne({
      where: { id_equipo: id },
      relations: ['mantenimientos', 'mantenimientos.usuario', 'alertas_stock'],
    });
    if (!e) throw new NotFoundException(`Equipo con id ${id} no encontrado`);
    return e;
  }

  async update(id: number, dto: UpdateEquipoDto): Promise<Equipo> {
    const e = await this.findOne(id);
    Object.assign(e, dto);
    return this.equipoRepo.save(e);
  }

  async remove(id: number): Promise<void> {
    const e = await this.findOne(id);
    await this.equipoRepo.remove(e);
  }

  // Métodos de inventario
  async obtenerEquiposBajoStock(): Promise<Equipo[]> {
    return this.equipoRepo
      .createQueryBuilder('equipo')
      .where('equipo.cantidad <= equipo.stock_minimo')
      .orderBy('equipo.cantidad', 'ASC')
      .getMany();
  }

  async obtenerInventarioTotal(): Promise<{ equipo_id: number; nombre: string; cantidad: number; valor_total: number }[]> {
    return this.equipoRepo
      .createQueryBuilder('equipo')
      .select('equipo.id_equipo', 'equipo_id')
      .addSelect('equipo.nombre', 'nombre')
      .addSelect('equipo.cantidad', 'cantidad')
      .addSelect('CAST(equipo.cantidad * equipo.precio_unitario AS FLOAT)', 'valor_total')
      .where('equipo.precio_unitario IS NOT NULL')
      .getRawMany();
  }

  async actualizarStock(id: number, cantidad: number, operacion: 'aumentar' | 'disminuir'): Promise<Equipo> {
    const equipo = await this.findOne(id);
    
    if (operacion === 'aumentar') {
      equipo.cantidad += cantidad;
    } else if (operacion === 'disminuir') {
      equipo.cantidad = Math.max(0, equipo.cantidad - cantidad);
    }
    
    return this.equipoRepo.save(equipo);
  }

  async obtenerEquiposConAlerta(): Promise<Equipo[]> {
    return this.equipoRepo
      .createQueryBuilder('equipo')
      .where('equipo.cantidad <= equipo.stock_minimo')
      .orWhere('equipo.cantidad >= equipo.stock_maximo')
      .leftJoinAndSelect('equipo.alertas_stock', 'alerta')
      .getMany();
  }
}
