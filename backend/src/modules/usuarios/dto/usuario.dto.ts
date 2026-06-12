import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  IsPositive,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Número de identificación único',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'La identificación es obligatoria' })
  @IsString()
  @MaxLength(50)
  identificacion!: string;

  @ApiProperty({
    example: 'juan@gymfit.com',
    description: 'Correo electrónico único',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @IsEmail({}, { message: 'El correo no tiene formato válido' })
  @MaxLength(100)
  correo!: string;

  @ApiProperty({
    example: 'miPassword123',
    description: 'Contraseña (mínimo 8 caracteres)',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    example: '3001234567',
    description: 'Teléfono de contacto',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @ApiProperty({
    example: 2,
    description: 'ID del rol a asignar (ver GET /api/roles)',
  })
  @IsNotEmpty({ message: 'El id del rol es obligatorio' })
  @IsInt()
  @IsPositive()
  id_rol!: number;
}
