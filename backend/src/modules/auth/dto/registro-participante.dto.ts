import { IsString, IsNotEmpty, MinLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistroConCodigoDto {
  @ApiProperty({ description: 'Código único para validación de participante' })
  @IsString()
  @IsNotEmpty({ message: 'El código es obligatorio' })
  codigo: string;

  @ApiProperty({ description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({ description: 'Número de documento / cédula' })
  @IsString()
  @IsNotEmpty({ message: 'La identificación es obligatoria' })
  identificacion: string;

  @ApiProperty({ description: 'Correo electrónico único' })
  @IsEmail({}, { message: 'El formato del correo no es válido' })
  correo: string;

  @ApiProperty({ description: 'Contraseña para la cuenta', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ description: 'Teléfono de contacto', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;
}
