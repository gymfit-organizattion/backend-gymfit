import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarPerfilDto {
  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description:
      'Nuevo nombre del usuario (campo no crítico — editable desde el perfil propio)',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede superar 100 caracteres' })
  nombre?: string;

  @ApiPropertyOptional({
    example: '3001234567',
    description:
      'Nuevo teléfono de contacto (campo no crítico — editable desde el perfil propio)',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El teléfono no puede superar 20 caracteres' })
  telefono?: string;
}
