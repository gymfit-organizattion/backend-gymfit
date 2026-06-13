import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './estrategies/jwt.strategy';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Rol } from '../roles/entities/rol.entity';
import { CodigoParticipante } from './entities/codigo-participante.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret)
          throw new Error('JWT_SECRET no está configurado en el .env');

        // CORRECCIÓN: sin parseInt — '8h' como string directo.
        // parseInt('8h') devolvía 8 (segundos), no 8 horas.
        const expiresIn = (config.get<string>('JWT_EXPIRES_IN') ??
          '8h') as `${number}${'s' | 'm' | 'h' | 'd'}`;

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
    TypeOrmModule.forFeature([Usuario, Rol, CodigoParticipante]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
