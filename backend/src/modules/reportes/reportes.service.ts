import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membresia } from '../membresias/entities/membresia.entity';
import { Asistencia } from '../asistencias/entities/asistencia.entity';
import { Equipo } from '../equipos/entities/equipo.entity';
import { AlertaStock } from '../alertas-stock/entities/alerta-stock.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Inscripcion } from '../inscripciones/entities/inscripcion.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Membresia)
    private readonly membresiaRepo: Repository<Membresia>,
    @InjectRepository(Asistencia)
    private readonly asistenciaRepo: Repository<Asistencia>,
    @InjectRepository(Equipo)
    private readonly equipoRepo: Repository<Equipo>,
    @InjectRepository(AlertaStock)
    private readonly alertaRepo: Repository<AlertaStock>,
    @InjectRepository(Socio)
    private readonly socioRepo: Repository<Socio>,
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepo: Repository<Inscripcion>,
  ) {}

  // ────────────────────────────────────────────────
  // Reporte de Membresías
  // ────────────────────────────────────────────────

  async reporteMembresias(desde?: string, hasta?: string) {
    const query = this.membresiaRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.socio', 'socio')
      .leftJoinAndSelect('socio.usuario', 'usuario')
      .leftJoinAndSelect('m.plan', 'plan');

    if (desde) query.andWhere('m.fecha_inicio >= :desde', { desde });
    if (hasta) query.andWhere('m.fecha_fin <= :hasta', { hasta });

    const membresias = await query.getMany();

    // Agrupar por estado
    const por_estado = membresias.reduce<Record<string, number>>((acc, m) => {
      acc[m.estado] = (acc[m.estado] ?? 0) + 1;
      return acc;
    }, {});

    // Agrupar por plan
    const por_plan = membresias.reduce<Record<string, number>>((acc, m) => {
      const nombre = m.plan?.nombre ?? 'Sin plan';
      acc[nombre] = (acc[nombre] ?? 0) + 1;
      return acc;
    }, {});

    // Ingresos estimados
    const ingresos_estimados = membresias.reduce((total, m) => {
      return total + (Number(m.plan?.precio) || 0);
    }, 0);

    return {
      total: membresias.length,
      por_estado,
      por_plan,
      ingresos_estimados,
      detalle: membresias.map((m) => ({
        id_membresia: m.id_membresia,
        socio: m.socio?.usuario?.nombre ?? 'N/A',
        plan: m.plan?.nombre ?? 'N/A',
        precio: m.plan?.precio ?? 0,
        fecha_inicio: m.fecha_inicio,
        fecha_fin: m.fecha_fin,
        estado: m.estado,
      })),
    };
  }

  // ────────────────────────────────────────────────
  // Reporte de Asistencias
  // ────────────────────────────────────────────────

  async reporteAsistencias(desde?: string, hasta?: string) {
    const query = this.asistenciaRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.socio', 'socio')
      .leftJoinAndSelect('socio.usuario', 'usuario');

    if (desde) query.andWhere('a.fecha >= :desde', { desde });
    if (hasta) query.andWhere('a.fecha <= :hasta', { hasta });

    const asistencias = await query.orderBy('a.fecha', 'DESC').getMany();

    // Asistencias por día de la semana
    const diasSemana = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const por_dia: Record<string, number> = {};
    for (const a of asistencias) {
      const dia = diasSemana[new Date(a.fecha).getDay()];
      por_dia[dia] = (por_dia[dia] ?? 0) + 1;
    }

    // Top 5 socios más frecuentes
    const frecuencia: Record<number, { nombre: string; total: number }> = {};
    for (const a of asistencias) {
      const id = a.socio?.id_socio;
      if (id) {
        if (!frecuencia[id]) {
          frecuencia[id] = {
            nombre: a.socio?.usuario?.nombre ?? 'N/A',
            total: 0,
          };
        }
        frecuencia[id].total++;
      }
    }
    const top_socios = Object.values(frecuencia)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      total: asistencias.length,
      por_dia_semana: por_dia,
      top_socios,
    };
  }

  // ────────────────────────────────────────────────
  // Reporte de Inventario
  // ────────────────────────────────────────────────

  async reporteInventario() {
    const equipos = await this.equipoRepo.find({
      relations: ['alertas_stock'],
      order: { nombre: 'ASC' },
    });

    const alertasActivas = await this.alertaRepo.count({
      where: { estado: 'activa' },
    });

    const bajo_stock = equipos.filter((e) => e.cantidad <= e.stock_minimo);
    const sobre_stock = equipos.filter(
      (e) => e.stock_maximo != null && e.cantidad >= e.stock_maximo,
    );
    const normal = equipos.filter(
      (e) =>
        e.cantidad > e.stock_minimo &&
        (e.stock_maximo == null || e.cantidad < e.stock_maximo),
    );

    const valor_total_inventario = equipos.reduce((acc, e) => {
      if (e.precio_unitario != null) {
        return acc + Number(e.precio_unitario) * e.cantidad;
      }
      return acc;
    }, 0);

    return {
      total_equipos: equipos.length,
      alertas_activas: alertasActivas,
      valor_total_inventario,
      resumen_stock: {
        bajo_stock: bajo_stock.length,
        sobre_stock: sobre_stock.length,
        normal: normal.length,
      },
      detalle: equipos.map((e) => ({
        id_equipo: e.id_equipo,
        nombre: e.nombre,
        tipo: e.tipo,
        estado: e.estado,
        cantidad: e.cantidad,
        stock_minimo: e.stock_minimo,
        stock_maximo: e.stock_maximo,
        precio_unitario: e.precio_unitario,
        valor_total:
          e.precio_unitario != null
            ? Number(e.precio_unitario) * e.cantidad
            : null,
        estado_stock:
          e.cantidad === 0
            ? 'agotado'
            : e.cantidad <= e.stock_minimo
              ? 'bajo_stock'
              : e.stock_maximo != null && e.cantidad >= e.stock_maximo
                ? 'sobre_stock'
                : 'normal',
      })),
    };
  }

  // ────────────────────────────────────────────────
  // Reporte General del Gimnasio (Dashboard)
  // ────────────────────────────────────────────────

  async reporteGeneral() {
    const hoy = new Date().toISOString().split('T')[0];
    const inicioMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    )
      .toISOString()
      .split('T')[0];

    const [
      totalSocios,
      membresiaActivas,
      membresiasVencidasMes,
      inscripcionesMes,
      asistenciasMes,
      alertasStock,
    ] = await Promise.all([
      this.socioRepo.count(),
      this.membresiaRepo.count({ where: { estado: 'activa' } }),
      this.membresiaRepo
        .createQueryBuilder('m')
        .where('m.estado = :estado', { estado: 'activa' })
        .andWhere('m.fecha_fin BETWEEN :inicio AND :fin', {
          inicio: inicioMes,
          fin: hoy,
        })
        .getCount(),
      this.inscripcionRepo
        .createQueryBuilder('i')
        .where('i.fecha_inscripcion >= :inicio', { inicio: inicioMes })
        .getCount(),
      this.asistenciaRepo
        .createQueryBuilder('a')
        .where('a.fecha >= :inicio', { inicio: inicioMes })
        .getCount(),
      this.alertaRepo.count({ where: { estado: 'activa' } }),
    ]);

    // Ingresos del mes
    const membresiasDelMes = await this.membresiaRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.plan', 'plan')
      .where('m.fecha_inicio >= :inicio', { inicio: inicioMes })
      .getMany();

    const ingresos_mes = membresiasDelMes.reduce((acc, m) => {
      return acc + (Number(m.plan?.precio) || 0);
    }, 0);

    return {
      fecha_generacion: new Date().toISOString(),
      periodo: { desde: inicioMes, hasta: hoy },
      socios: {
        total: totalSocios,
        membresias_activas: membresiaActivas,
        membresias_vencidas_mes: membresiasVencidasMes,
      },
      actividad: {
        inscripciones_mes: inscripcionesMes,
        asistencias_mes: asistenciasMes,
      },
      finanzas: {
        ingresos_mes,
      },
      inventario: {
        alertas_activas: alertasStock,
      },
    };
  }
}
