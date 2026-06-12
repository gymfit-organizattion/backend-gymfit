import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Membresia } from '../membresias/entities/membresia.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateAsistenciaDto, RespuestaAcceso } from './dto/asistencia.dto';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistenciaRepo: Repository<Asistencia>,
    @InjectRepository(Socio)
    private readonly socioRepo: Repository<Socio>,
    @InjectRepository(Membresia)
    private readonly membresiaRepo: Repository<Membresia>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // RF-016 — VALIDAR ACCESO AL GIMNASIO
  // Criterio HU-16: respuesta visual Verde/Rojo + registro automático

  async validarAcceso(identificacion: string): Promise<RespuestaAcceso> {
    // 1. Buscar el usuario por su número de identificación
    const usuario = await this.usuarioRepo.findOne({
      where: { identificacion },
      relations: ['rol'],
    });

    if (!usuario) {
      return {
        acceso: false,
        color: 'rojo',
        motivo: 'No existe ningún usuario registrado con esa identificación.',
      };
    }

    // 2. Verificar que el usuario esté activo en el sistema
    if (!usuario.estado) {
      return {
        acceso: false,
        color: 'rojo',
        motivo:
          'El usuario está inactivo en el sistema. Consulte con administración.',
        socio: undefined,
      };
    }

    // 3. Verificar que el usuario tenga perfil de socio
    const socio = await this.socioRepo.findOne({
      where: { usuario: { id_usuario: usuario.id_usuario } },
      relations: ['usuario'],
    });

    if (!socio) {
      return {
        acceso: false,
        color: 'rojo',
        motivo: `El usuario "${usuario.nombre}" no está registrado como socio del gimnasio.`,
      };
    }

    // 4. Buscar la membresía más reciente del socio
    const membresias = await this.membresiaRepo.find({
      where: { socio: { id_socio: socio.id_socio } },
      relations: ['plan'],
      order: { fecha_fin: 'DESC' },
    });

    // 5. Si no tiene ninguna membresía
    if (!membresias || membresias.length === 0) {
      return {
        acceso: false,
        color: 'rojo',
        motivo: `El socio "${usuario.nombre}" no tiene ninguna membresía asignada.`,
        socio: {
          id_socio: socio.id_socio,
          nombre: usuario.nombre,
          identificacion: usuario.identificacion,
        },
      };
    }

    // 6. Calcular días restantes y verificar membresía activa
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar una membresía que esté activa HOY:
    // - estado = 'activa'
    // - fecha_inicio <= hoy
    // - fecha_fin >= hoy
    const membresiaValida = membresias.find((m) => {
      const inicio = new Date(m.fecha_inicio);
      const fin = new Date(m.fecha_fin);
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(23, 59, 59, 999);
      return m.estado.toLowerCase() === 'activa' && inicio <= hoy && fin >= hoy;
    });

    // 7. Sin membresía activa hoy — acceso denegado
    if (!membresiaValida) {
      // Mostrar cuándo venció la última membresía
      const ultima = membresias[0];
      const finUltima = new Date(ultima.fecha_fin);
      const diasVencida = Math.ceil(
        (hoy.getTime() - finUltima.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        acceso: false,
        color: 'rojo',
        motivo: `La membresía del socio "${usuario.nombre}" está vencida hace ${diasVencida} día(s). Plan: ${ultima.plan.nombre}. Debe renovar para poder ingresar.`,
        socio: {
          id_socio: socio.id_socio,
          nombre: usuario.nombre,
          identificacion: usuario.identificacion,
        },
        membresia: {
          id_membresia: ultima.id_membresia,
          plan: ultima.plan.nombre,
          fecha_fin: ultima.fecha_fin,
          estado: ultima.estado,
          dias_restantes: -diasVencida,
        },
      };
    }

    // 8. Membresía válida — calcular días restantes
    const finValida = new Date(membresiaValida.fecha_fin);
    finValida.setHours(23, 59, 59, 999);
    const diasRestantes = Math.ceil(
      (finValida.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    // 9. Registrar la asistencia automáticamente (RF-017 integrado)
    const asistencia = this.asistenciaRepo.create({ socio });
    await this.asistenciaRepo.save(asistencia);

    // 10. Devolver respuesta verde con todos los datos
    return {
      acceso: true,
      color: 'verde',
      motivo: `Acceso permitido. Bienvenido, ${usuario.nombre}. Le quedan ${diasRestantes} día(s) de membresía.`,
      socio: {
        id_socio: socio.id_socio,
        nombre: usuario.nombre,
        identificacion: usuario.identificacion,
      },
      membresia: {
        id_membresia: membresiaValida.id_membresia,
        plan: membresiaValida.plan.nombre,
        fecha_fin: membresiaValida.fecha_fin,
        estado: membresiaValida.estado,
        dias_restantes: diasRestantes,
      },
      asistencia_registrada: true,
    };
  }

  // RF-017 — REGISTRAR ASISTENCIA MANUAL (por id_socio directo)

  async registrar(dto: CreateAsistenciaDto): Promise<Asistencia> {
    const socio = await this.socioRepo.findOne({
      where: { id_socio: dto.id_socio },
    });
    if (!socio) {
      throw new NotFoundException(`Socio con id ${dto.id_socio} no encontrado`);
    }
    const asistencia = this.asistenciaRepo.create({ socio });
    return this.asistenciaRepo.save(asistencia);
  }

  // CONSULTAS

  findAll(): Promise<Asistencia[]> {
    return this.asistenciaRepo.find({
      relations: ['socio', 'socio.usuario'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Asistencia> {
    const a = await this.asistenciaRepo.findOne({
      where: { id_asistencia: id },
      relations: ['socio', 'socio.usuario'],
    });
    if (!a)
      throw new NotFoundException(`Asistencia con id ${id} no encontrada`);
    return a;
  }

  findBySocio(idSocio: number): Promise<Asistencia[]> {
    return this.asistenciaRepo.find({
      where: { socio: { id_socio: idSocio } },
      relations: ['socio', 'socio.usuario'],
      order: { fecha: 'DESC' },
    });
  }

  // Asistencias del día actual (útil para reportes de recepción)
  async findHoy(): Promise<Asistencia[]> {
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);

    const hoySiguiente = new Date();
    hoySiguiente.setHours(23, 59, 59, 999);

    return this.asistenciaRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.socio', 's')
      .leftJoinAndSelect('s.usuario', 'u')
      .where('a.fecha >= :inicio', { inicio: hoyInicio })
      .andWhere('a.fecha <= :fin', { fin: hoySiguiente })
      .orderBy('a.fecha', 'DESC')
      .getMany();
  }

  async remove(id: number): Promise<void> {
    const a = await this.findOne(id);
    await this.asistenciaRepo.remove(a);
  }
}
