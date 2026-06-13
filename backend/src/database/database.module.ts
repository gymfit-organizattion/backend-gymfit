import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

//  Entidades
import { Rol } from '../modules/roles/entities/rol.entity';
import { Usuario } from '../modules/usuarios/entities/usuario.entity';
import { Prospecto } from '../modules/prospectos/entities/prospecto.entity';
import { Socio } from '../modules/socios/entities/socio.entity';
import { Entrenador } from '../modules/entrenadores/entities/entrenador.entity';
import { Asignacion } from '../modules/entrenadores/entities/asignacion.entity';
import { Plan } from '../modules/planes/entities/plan.entity';
import { Membresia } from '../modules/membresias/entities/membresia.entity';
import { Ejercicio } from '../modules/ejercicios/entities/ejercicio.entity';
import { Rutina } from '../modules/rutinas/entities/rutina.entity';
import { RutinaEjercicio } from '../modules/rutinas/entities/rutina-ejercicio.entity';
import { AsignacionRutina } from '../modules/rutinas/entities/asignacion-rutina.entity';
import { Clase } from '../modules/clases/entities/clase.entity';
import { Inscripcion } from '../modules/inscripciones/entities/inscripcion.entity';
import { Evaluacion } from '../modules/evaluaciones/entities/evaluacion.entity';
import { Progreso } from '../modules/progreso/entities/progreso.entity';
import { Asistencia } from '../modules/asistencias/entities/asistencia.entity';
import { Equipo } from '../modules/equipos/entities/equipo.entity';
import { Mantenimiento } from '../modules/mantenimiento/entities/mantenimiento.entity';
import { AlertaStock } from '../modules/alertas-stock/entities/alerta-stock.entity';
import { Notificacion } from '../modules/notificaciones/entities/notificacion.entity';
import { CodigoParticipante } from '../modules/auth/entities/codigo-participante.entity';

const ENTITIES = [
  Rol,
  Usuario,
  Prospecto,
  Socio,
  Entrenador,
  Asignacion,
  Plan,
  Membresia,
  Ejercicio,
  Rutina,
  RutinaEjercicio,
  AsignacionRutina,
  Clase,
  Inscripcion,
  Evaluacion,
  Progreso,
  Asistencia,
  Equipo,
  Mantenimiento,
  AlertaStock,
  Notificacion,
  CodigoParticipante,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';
        const url = config.get<string>('DATABASE_URL');

        return {
          type: 'postgres',
          ...(url
            ? { url }
            : {
                host: config.get<string>('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get<string>('DB_USERNAME'),
                password: config.get<string>('DB_PASSWORD'),
                database: config.get<string>('DB_NAME'),
              }),
          entities: ENTITIES,
          synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true' || !isProduction,
          logging: !isProduction,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
