import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //  Prefijo global
  app.setGlobalPrefix('api');

  // CORS
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  //ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger / OpenAPI
  // Disponible en: http://localhost:3001/docs
  // Solo en desarrollo para no exponer la documentación en producción.
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('GymFit API')
      .setDescription(
        'API REST del sistema de administración y control de GymFit. ' +
          'Autenticación mediante JWT Bearer Token. ' +
          'Usa el botón "Authorize" e ingresa tu token para probar rutas protegidas.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Ingresa el token JWT obtenido en POST /api/auth/login',
          in: 'header',
        },
        'JWT-auth', // nombre del esquema — se referencia en @ApiBearerAuth()
      )
      .addTag('Auth', 'Registro, login y gestión del perfil propio')
      .addTag('Usuarios', 'CRUD de usuarios del sistema (solo admin)')
      .addTag('Roles', 'Gestión de roles y semilla inicial')
      .addTag('Socios', 'Gestión de miembros del gimnasio')
      .addTag('Membresías', 'Planes y membresías de socios')
      .addTag('Rutinas', 'Rutinas y ejercicios asignados')
      .addTag('Clases', 'Clases grupales e inscripciones')
      .addTag('Entrenadores', 'Personal de entrenamiento')
      .addTag('Asistencias', 'Control de acceso y asistencia')
      .addTag('Evaluaciones', 'Evaluaciones físicas de socios')
      .addTag('Progreso', 'Seguimiento de progreso')
      .addTag('Equipos', 'Inventario de equipos')
      .addTag('Mantenimiento', 'Mantenimiento de equipos')
      .addTag('Prospectos', 'Gestión de prospectos y conversión a socios')
      .addTag('Reportes', 'Reportes financieros y de asistencia')
      .addTag('Planes', 'Planes de membresía disponibles')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // mantiene el token entre recargas
        displayRequestDuration: true, // muestra el tiempo de cada request
        docExpansion: 'none', // colapsa todos los endpoints por defecto
        filter: true, // barra de búsqueda de endpoints
        showExtensions: true,
        tryItOutEnabled: true, // "Try it out" habilitado por defecto
      },
      customSiteTitle: 'GymFit API Docs',
    });

    console.log(
      `📚 Swagger disponible en: http://localhost:${process.env.PORT ?? 3001}/docs`,
    );
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 GymFit backend corriendo en: http://localhost:${port}/api`);
}
bootstrap();
