import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RutinasController } from './rutinas.controller';
import { RutinasService } from './rutinas.service';
import { Rutina } from './entities/rutina.entity';
import { RutinaEjercicio } from './entities/rutina-ejercicio.entity';
import { AsignacionRutina } from './entities/asignacion-rutina.entity';
import { Ejercicio } from '../ejercicios/entities/ejercicio.entity';
import { Socio } from '../socios/entities/socio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rutina,
      RutinaEjercicio,
      AsignacionRutina,
      Ejercicio,
      Socio,
    ]),
  ],
  controllers: [RutinasController],
  providers: [RutinasService],
  exports: [TypeOrmModule, RutinasService],
})
export class RutinasModule {}
