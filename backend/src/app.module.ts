import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService }    from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CommonModule }        from './common/common.module';
import { DatabaseModule }      from './database/database.module';
import { AuthModule }          from './modules/auth/auth.module';
import { UsuariosModule }      from './modules/usuarios/usuarios.module';
import { RolesModule }         from './modules/roles/roles.module';
import { ProspectosModule }    from './modules/prospectos/prospectos.module';
import { SociosModule }        from './modules/socios/socios.module';
import { EntrenadoresModule }  from './modules/entrenadores/entrenadores.module';
import { PlanesModule }        from './modules/planes/planes.module';
import { MembresiasModule }    from './modules/membresias/membresias.module';
import { RutinasModule }       from './modules/rutinas/rutinas.module';
import { EjerciciosModule }    from './modules/ejercicios/ejercicios.module';
import { ClasesModule }        from './modules/clases/clases.module';
import { InscripcionesModule } from './modules/inscripciones/inscripciones.module';
import { EvaluacionesModule }  from './modules/evaluaciones/evaluaciones.module';
import { ProgresoModule }      from './modules/progreso/progreso.module';
import { EquiposModule }       from './modules/equipos/equipos.module';
import { MantenimientoModule } from './modules/mantenimiento/mantenimiento.module';
import { AsistenciasModule }   from './modules/asistencias/asistencias.module';
import { AlertasStockModule }  from './modules/alertas-stock/alertas-stock.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { ReportesModule }      from './modules/reportes/reportes.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    CommonModule,
    DatabaseModule,
    AuthModule,
    RolesModule,
    UsuariosModule,
    ProspectosModule,   
    SociosModule,
    EntrenadoresModule,
    PlanesModule,
    MembresiasModule,
    EjerciciosModule,
    RutinasModule,
    ClasesModule,
    InscripcionesModule,
    EvaluacionesModule,
    ProgresoModule,
    AsistenciasModule,
    EquiposModule,
    MantenimientoModule,
    AlertasStockModule,
    NotificacionesModule,
    ReportesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
