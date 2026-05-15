import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgresoController } from './progreso.controller';
import { ProgresoService } from './progreso.service';
import { Progreso } from './entities/progreso.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Evaluacion } from '../evaluaciones/entities/evaluacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Progreso, Socio, Evaluacion])],
  controllers: [ProgresoController],
  providers: [ProgresoService],
  exports: [TypeOrmModule, ProgresoService],
})
export class ProgresoModule {}
