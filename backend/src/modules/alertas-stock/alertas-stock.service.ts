import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipo } from '../equipos/entities/equipo.entity';
import {
  CreateAlertaStockDto,
  ResolverAlertaStockDto,
  UpdateAlertaStockDto,
} from './dto/alerta-stock.dto';
import { AlertaStock } from './entities/alerta-stock.entity';

@Injectable()
export class AlertasStockService {
  constructor(
    @InjectRepository(AlertaStock)
    private readonly alertaRepo: Repository<AlertaStock>,
    @InjectRepository(Equipo)
    private readonly equipoRepo: Repository<Equipo>,
  ) {}

  async create(dto: CreateAlertaStockDto): Promise<AlertaStock> {
    const equipo = await this.equipoRepo.findOne({
      where: { id_equipo: dto.id_equipo },
    });

    if (!equipo) {
      throw new NotFoundException(
        `Equipo con id ${dto.id_equipo} no encontrado`,
      );
    }

    const diferencia = dto.cantidad_actual - dto.cantidad_esperada;

    const alerta = this.alertaRepo.create({
      equipo,
      tipo: dto.tipo,
      descripcion: dto.descripcion || null,
      cantidad_actual: dto.cantidad_actual,
      cantidad_esperada: dto.cantidad_esperada,
      diferencia,
      estado: 'activa',
    });

    return this.alertaRepo.save(alerta);
  }

  async findAll(estado?: string): Promise<AlertaStock[]> {
    const query = this.alertaRepo.createQueryBuilder('alerta');

    if (estado) {
      query.where('alerta.estado = :estado', { estado });
    }

    return query
      .leftJoinAndSelect('alerta.equipo', 'equipo')
      .orderBy('alerta.fecha_creacion', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<AlertaStock> {
    const alerta = await this.alertaRepo.findOne({
      where: { id_alerta: id },
      relations: ['equipo'],
    });

    if (!alerta) {
      throw new NotFoundException(`Alerta con id ${id} no encontrada`);
    }

    return alerta;
  }

  async update(id: number, dto: UpdateAlertaStockDto): Promise<AlertaStock> {
    const alerta = await this.findOne(id);
    Object.assign(alerta, dto);
    return this.alertaRepo.save(alerta);
  }

  async resolverAlerta(
    id: number,
    dto: ResolverAlertaStockDto,
  ): Promise<AlertaStock> {
    const alerta = await this.findOne(id);

    if (alerta.estado !== 'activa') {
      throw new BadRequestException('Esta alerta ya ha sido procesada');
    }

    alerta.estado = dto.estado;
    return this.alertaRepo.save(alerta);
  }

  async remove(id: number): Promise<void> {
    const alerta = await this.findOne(id);
    await this.alertaRepo.remove(alerta);
  }

  async obtenerAlertasActivas(): Promise<AlertaStock[]> {
    return this.alertaRepo.find({
      where: { estado: 'activa' },
      relations: ['equipo'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async obtenerAlertasPorTipo(
    tipo: 'bajo_stock' | 'sobre_stock' | 'agotado',
  ): Promise<AlertaStock[]> {
    return this.alertaRepo.find({
      where: { tipo, estado: 'activa' },
      relations: ['equipo'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async generarAlertasAutomaticas(): Promise<AlertaStock[]> {
    const equiposBajoStock = await this.equipoRepo
      .createQueryBuilder('equipo')
      .where('equipo.cantidad <= equipo.stock_minimo')
      .getMany();

    const equiposSobreStock = await this.equipoRepo
      .createQueryBuilder('equipo')
      .where('equipo.cantidad >= equipo.stock_maximo')
      .andWhere('equipo.stock_maximo IS NOT NULL')
      .getMany();

    const alertasCreadas: AlertaStock[] = [];

    // Crear alertas de bajo stock
    for (const equipo of equiposBajoStock) {
      const alertaExistente = await this.alertaRepo.findOne({
        where: {
          equipo: { id_equipo: equipo.id_equipo },
          tipo: 'bajo_stock',
          estado: 'activa',
        },
      });

      if (!alertaExistente) {
        const alerta = this.alertaRepo.create({
          equipo,
          tipo: 'bajo_stock',
          descripcion: `Stock bajo para ${equipo.nombre}`,
          cantidad_actual: equipo.cantidad,
          cantidad_esperada: equipo.stock_minimo,
          diferencia: equipo.cantidad - equipo.stock_minimo,
          estado: 'activa',
        });

        const saved = await this.alertaRepo.save(alerta);
        alertasCreadas.push(saved);
      }
    }

    // Crear alertas de sobre stock
    for (const equipo of equiposSobreStock) {
      const alertaExistente = await this.alertaRepo.findOne({
        where: {
          equipo: { id_equipo: equipo.id_equipo },
          tipo: 'sobre_stock',
          estado: 'activa',
        },
      });

      if (!alertaExistente) {
        const alerta = this.alertaRepo.create({
          equipo,
          tipo: 'sobre_stock',
          descripcion: `Stock excesivo para ${equipo.nombre}`,
          cantidad_actual: equipo.cantidad,
          cantidad_esperada: equipo.stock_maximo!,
          diferencia: equipo.cantidad - equipo.stock_maximo!,
          estado: 'activa',
        });

        const saved = await this.alertaRepo.save(alerta);
        alertasCreadas.push(saved);
      }
    }

    return alertasCreadas;
  }

  async obtenerEstadisticasAlertas(): Promise<{
    total: number;
    activas: number;
    resueltas: number;
    ignoradas: number;
    por_tipo: Record<string, number>;
  }> {
    const total = await this.alertaRepo.count();
    const activas = await this.alertaRepo.count({
      where: { estado: 'activa' },
    });
    const resueltas = await this.alertaRepo.count({
      where: { estado: 'resuelta' },
    });
    const ignoradas = await this.alertaRepo.count({
      where: { estado: 'ignorada' },
    });

    const porTipo = await this.alertaRepo
      .createQueryBuilder('alerta')
      .select('alerta.tipo', 'tipo')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('alerta.tipo')
      .getRawMany();

    return {
      total,
      activas,
      resueltas,
      ignoradas,
      por_tipo: porTipo.reduce(
        (acc, item) => ({
          ...acc,
          [item.tipo]: Number.parseInt(item.cantidad, 10),
        }),
        {},
      ),
    };
  }
}
