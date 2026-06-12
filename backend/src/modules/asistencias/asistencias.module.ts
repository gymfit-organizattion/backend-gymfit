import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciasController } from './asistencias.controller';
import { AsistenciasService } from './asistencias.service';
import { Asistencia } from './entities/asistencia.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Membresia } from '../membresias/entities/membresia.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asistencia, Socio, Membresia, Usuario])],
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  exports: [TypeOrmModule, AsistenciasService],
})
export class AsistenciasModule {}
