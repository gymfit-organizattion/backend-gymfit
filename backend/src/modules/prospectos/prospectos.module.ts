import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProspectosController } from './prospectos.controller';
import { ProspectosService } from './prospectos.service';
import { Prospecto } from './entities/prospecto.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Rol } from '../roles/entities/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prospecto, Usuario, Socio, Rol])],
  controllers: [ProspectosController],
  providers: [ProspectosService],
  exports: [TypeOrmModule, ProspectosService],
})
export class ProspectosModule {}
