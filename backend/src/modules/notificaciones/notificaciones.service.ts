import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { CreateNotificacionDto, UpdateNotificacionDto, MarcarLeidaDto } from './dto/notificacion.dto';
import { Membresia } from '../membresias/entities/membresia.entity';
import { Equipo } from '../equipos/entities/equipo.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepo: Repository<Notificacion>,
    @InjectRepository(Membresia)
    private readonly membresiaRepo: Repository<Membresia>,
    @InjectRepository(Equipo)
    private readonly equipoRepo: Repository<Equipo>,
  ) { }

  // CRUD básico

  async create(dto: CreateNotificacionDto): Promise<Notificacion> {
    const notif = this.notificacionRepo.create({
      id_usuario: dto.id_usuario ?? null,
      tipo: dto.tipo,
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      referencia_id: dto.referencia_id ?? null,
      referencia_tipo: dto.referencia_tipo ?? null,
      leida: false,
    });
    return this.notificacionRepo.save(notif);
  }

  async findAll(id_usuario?: number): Promise<Notificacion[]> {
    const query = this.notificacionRepo.createQueryBuilder('n');
    if (id_usuario) {
      query.where('n.id_usuario = :id_usuario OR n.id_usuario IS NULL', { id_usuario });
    }
    return query.orderBy('n.fecha_creacion', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Notificacion> {
    const notif = await this.notificacionRepo.findOne({
      where: { id_notificacion: id },
    });
    if (!notif) throw new NotFoundException(`Notificación con id ${id} no encontrada`);
    return notif;
  }

  async update(id: number, dto: UpdateNotificacionDto): Promise<Notificacion> {
    const notif = await this.findOne(id);
    Object.assign(notif, dto);
    return this.notificacionRepo.save(notif);
  }

  async remove(id: number): Promise<void> {
    const notif = await this.findOne(id);
    await this.notificacionRepo.remove(notif);
  }

  // Marcar como leída(s)

  async marcarLeidas(id_usuario: number, dto: MarcarLeidaDto): Promise<{ actualizadas: number }> {
    const query = this.notificacionRepo.createQueryBuilder()
      .update(Notificacion)
      .set({ leida: true });

    if (dto.ids && dto.ids.length > 0) {
      query.where('id_notificacion IN (:...ids) AND id_usuario = :id_usuario', {
        ids: dto.ids,
        id_usuario,
      });
    } else {
      query.where('id_usuario = :id_usuario AND leida = false', { id_usuario });
    }

    const result = await query.execute();
    return { actualizadas: result.affected ?? 0 };
  }

  async contarNoLeidas(id_usuario: number): Promise<{ total: number }> {
    const total = await this.notificacionRepo.count({
      where: { id_usuario, leida: false },
    });
    return { total };
  }

  // Notificaciones automáticas — RF-021, RF-022

  /**
   * Ejecuta la verificación de vencimientos cada día a la medianoche (HU-22).
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async revisarVencimientosDiarios() {
    console.log('[CRON] Iniciando revisión automática de membresías próximas a vencer...');
    const creadas = await this.generarNotificacionesMembresias(5);

    // Simulación del envío automático de correos (Criterio de Aceptación HU-22)
    for (const notif of creadas) {
      console.log(`[EMAIL ENVIADO] A: Socio ID ${notif.id_usuario} | Asunto: ${notif.titulo} | Mensaje: ${notif.mensaje}`);
    }

    console.log(`[CRON] Revisión finalizada. Se enviaron ${creadas.length} avisos de vencimiento.`);
  }

  /**
   * Genera notificaciones para membresías que vencen en los próximos N días.
   * Por defecto: 5 días.
   */
  async generarNotificacionesMembresias(diasAviso = 5): Promise<Notificacion[]> {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + diasAviso);

    const hoyStr = hoy.toISOString().split('T')[0];
    const limiteStr = limite.toISOString().split('T')[0];

    // Membresías activas que vencen en el rango
    const membresias = await this.membresiaRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.socio', 'socio')
      .leftJoinAndSelect('socio.usuario', 'usuario')
      .leftJoinAndSelect('m.plan', 'plan')
      .where('m.estado = :estado', { estado: 'activa' })
      .andWhere('m.fecha_fin BETWEEN :hoy AND :limite', { hoy: hoyStr, limite: limiteStr })
      .getMany();

    const creadas: Notificacion[] = [];

    for (const membresia of membresias) {
      const idUsuario = membresia.socio?.usuario?.id_usuario ?? null;
      const nombreSocio = membresia.socio?.usuario?.nombre ?? 'Socio';
      const fechaFin = membresia.fecha_fin;

      // Evitar duplicados: no crear si ya existe una notificación activa para esta membresía
      const existente = await this.notificacionRepo.findOne({
        where: {
          referencia_id: membresia.id_membresia,
          referencia_tipo: 'membresia',
          tipo: 'membresia_por_vencer',
          leida: false,
        },
      });

      if (!existente) {
        const notif = await this.create({
          id_usuario: idUsuario,
          tipo: 'membresia_por_vencer',
          titulo: 'Membresía próxima a vencer',
          mensaje: `La membresía de ${nombreSocio} vence el ${fechaFin}. Se recomienda gestionar la renovación.`,
          referencia_id: membresia.id_membresia,
          referencia_tipo: 'membresia',
        });
        creadas.push(notif);
      }
    }

    return creadas;
  }

  /**
   * Genera notificaciones para equipos con stock bajo.
   */
  async generarNotificacionesStockBajo(): Promise<Notificacion[]> {
    const equiposBajoStock = await this.equipoRepo
      .createQueryBuilder('e')
      .where('e.cantidad <= e.stock_minimo')
      .getMany();

    const creadas: Notificacion[] = [];

    for (const equipo of equiposBajoStock) {
      const existente = await this.notificacionRepo.findOne({
        where: {
          referencia_id: equipo.id_equipo,
          referencia_tipo: 'equipo',
          tipo: 'stock_bajo',
          leida: false,
        },
      });

      if (!existente) {
        const notif = await this.create({
          id_usuario: undefined, // Notificación global para admins
          tipo: 'stock_bajo',
          titulo: 'Stock bajo detectado',
          mensaje: `El equipo "${equipo.nombre}" tiene ${equipo.cantidad} unidades, por debajo del mínimo de ${equipo.stock_minimo}.`,
          referencia_id: equipo.id_equipo,
          referencia_tipo: 'equipo',
        });
        creadas.push(notif);
      }
    }

    return creadas;
  }

  /**
   * Ejecuta todas las generaciones automáticas en un solo llamado.
   */
  async generarTodasAutomaticas(): Promise<{
    membresias: number;
    stock: number;
    total: number;
  }> {
    const notifMembresias = await this.generarNotificacionesMembresias();
    const notifStock = await this.generarNotificacionesStockBajo();

    return {
      membresias: notifMembresias.length,
      stock: notifStock.length,
      total: notifMembresias.length + notifStock.length,
    };
  }

  async obtenerEstadisticas(): Promise<{
    total: number;
    no_leidas: number;
    por_tipo: Record<string, number>;
  }> {
    const total = await this.notificacionRepo.count();
    const no_leidas = await this.notificacionRepo.count({ where: { leida: false } });

    const porTipo = await this.notificacionRepo
      .createQueryBuilder('n')
      .select('n.tipo', 'tipo')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('n.tipo')
      .getRawMany();

    return {
      total,
      no_leidas,
      por_tipo: porTipo.reduce(
        (acc, item) => ({ ...acc, [item.tipo]: Number.parseInt(item.cantidad, 10) }),
        {},
      ),
    };
  }
}
