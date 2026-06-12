import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SociosController } from './socios.controller';
import { SociosService } from './socios.service';
import { Socio } from './entities/socio.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Prospecto } from '../prospectos/entities/prospecto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Socio, Usuario, Prospecto])],
  controllers: [SociosController],
  providers: [SociosService],
  exports: [TypeOrmModule, SociosService],
})
export class SociosModule {}
