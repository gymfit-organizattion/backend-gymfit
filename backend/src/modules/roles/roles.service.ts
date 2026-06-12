import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { CreateRolDto, UpdateRolDto } from './dto/rol.dto';

// Roles del sistema definidos en el SRS
const ROLES_SISTEMA = ['admin', 'entrenador', 'recepcionista', 'socio'];

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) {}

  //  Seed inicial — solo inserta si la tabla está vacía
  async seed(): Promise<{ mensaje: string; roles: Rol[] }> {
    const existentes = await this.rolRepo.find();
    if (existentes.length > 0) {
      return {
        mensaje: 'Los roles ya están inicializados',
        roles: existentes,
      };
    }

    const roles = this.rolRepo.create(
      ROLES_SISTEMA.map((nombre) => ({ nombre })),
    );
    const guardados = await this.rolRepo.save(roles);
    return {
      mensaje: `${guardados.length} roles creados correctamente`,
      roles: guardados,
    };
  }

  //  CRUD protegido — solo admin
  async create(dto: CreateRolDto): Promise<Rol> {
    const existe = await this.rolRepo.findOne({
      where: { nombre: dto.nombre },
    });
    if (existe) throw new ConflictException(`El rol "${dto.nombre}" ya existe`);
    const rol = this.rolRepo.create(dto);
    return this.rolRepo.save(rol);
  }

  findAll(): Promise<Rol[]> {
    return this.rolRepo.find({ order: { id_rol: 'ASC' } });
  }

  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolRepo.findOne({ where: { id_rol: id } });
    if (!rol) throw new NotFoundException(`Rol con id ${id} no encontrado`);
    return rol;
  }

  async update(id: number, dto: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOne(id);
    Object.assign(rol, dto);
    return this.rolRepo.save(rol);
  }

  async remove(id: number): Promise<void> {
    const rol = await this.findOne(id);
    await this.rolRepo.remove(rol);
  }
}
