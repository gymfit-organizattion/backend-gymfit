import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membresia } from './entities/membresia.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Plan } from '../planes/entities/plan.entity';
import { CreateMembresiaDto, UpdateMembresiaDto } from './dto/membresia.dto';

@Injectable()
export class MembresiasService {
  private readonly logger = new Logger(MembresiasService.name);

  constructor(
    @InjectRepository(Membresia)
    private readonly membresiaRepo: Repository<Membresia>,
    @InjectRepository(Socio)
    private readonly socioRepo: Repository<Socio>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async create(dto: CreateMembresiaDto): Promise<Membresia> {
    const socio = await this.socioRepo.findOne({ where: { id_socio: dto.id_socio } });
    if (!socio) throw new NotFoundException(`Socio con id ${dto.id_socio} no encontrado`);

    const plan = await this.planRepo.findOne({ where: { id_plan: dto.id_plan } });
    if (!plan) throw new NotFoundException(`Plan con id ${dto.id_plan} no encontrado`);

    if (new Date(dto.fecha_fin) <= new Date(dto.fecha_inicio))
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');

    const membresia = this.membresiaRepo.create({ socio, plan, ...dto, estado: 'activa' });
    return this.membresiaRepo.save(membresia);
  }

  findAll(): Promise<Membresia[]> {
    return this.membresiaRepo.find({
      relations: ['socio', 'socio.usuario', 'plan'],
      order: { id_membresia: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Membresia> {
    const m = await this.membresiaRepo.findOne({
      where: { id_membresia: id },
      relations: ['socio', 'socio.usuario', 'plan'],
    });
    if (!m) throw new NotFoundException(`Membresía con id ${id} no encontrada`);
    return m;
  }

  findBySocio(idSocio: number): Promise<Membresia[]> {
    return this.membresiaRepo.find({
      where: { socio: { id_socio: idSocio } },
      relations: ['plan'],
      order: { id_membresia: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateMembresiaDto): Promise<Membresia> {
    const m = await this.findOne(id);
    Object.assign(m, dto);
    return this.membresiaRepo.save(m);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async actualizarMembresiasVencidas() {
    this.logger.log('Iniciando tarea programada: Actualización de membresías vencidas');
    const hoy = new Date();
    
    // Buscar membresías activas cuya fecha de fin ya pasó
    const membresiasVencidas = await this.membresiaRepo
      .createQueryBuilder('membresia')
      .where('membresia.estado = :estado', { estado: 'activa' })
      .andWhere('membresia.fecha_fin < :hoy', { hoy })
      .getMany();

    if (membresiasVencidas.length > 0) {
      for (const m of membresiasVencidas) {
        m.estado = 'vencida';
      }
      await this.membresiaRepo.save(membresiasVencidas);
      this.logger.log(`Se actualizaron ${membresiasVencidas.length} membresías a estado 'vencida'.`);
    } else {
      this.logger.log('No hay membresías vencidas para actualizar hoy.');
    }
  }

  async remove(id: number): Promise<void> {
    const m = await this.findOne(id);
    await this.membresiaRepo.remove(m);
  }
}
