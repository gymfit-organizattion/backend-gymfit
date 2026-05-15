import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluacionesController } from './evaluaciones.controller';
import { EvaluacionesService } from './evaluaciones.service';
import { Evaluacion } from './entities/evaluacion.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Entrenador } from '../entrenadores/entities/entrenador.entity';
import { Asignacion } from '../entrenadores/entities/asignacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evaluacion, Socio, Entrenador, Asignacion])],
  controllers: [EvaluacionesController],
  providers: [EvaluacionesService],
  exports: [TypeOrmModule, EvaluacionesService],
})
export class EvaluacionesModule {}
