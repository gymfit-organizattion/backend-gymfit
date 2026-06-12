import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Membresia } from '../membresias/entities/membresia.entity';
import { Asistencia } from '../asistencias/entities/asistencia.entity';
import { Equipo } from '../equipos/entities/equipo.entity';
import { AlertaStock } from '../alertas-stock/entities/alerta-stock.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Inscripcion } from '../inscripciones/entities/inscripcion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Membresia,
      Asistencia,
      Equipo,
      AlertaStock,
      Socio,
      Inscripcion,
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
