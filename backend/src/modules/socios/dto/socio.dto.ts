import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSocioDto {
  @IsNotEmpty({ message: 'El id del usuario es obligatorio' })
  @IsInt({ message: 'El id del usuario debe ser un número entero' })
  @IsPositive({ message: 'El id del usuario debe ser un número positivo' })
  id_usuario!: number;

  @IsOptional({ message: 'El id del prospecto es opcional' })
  @IsInt({ message: 'El id del prospecto debe ser un número entero' })
  @IsPositive({ message: 'El id del prospecto debe ser un número positivo' })
  id_prospecto?: number;

  @IsOptional({ message: 'La dirección es opcional' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(150)
  direccion?: string;

  @IsOptional({ message: 'Los datos de salud son opcionales' })
  @IsString({ message: 'Los datos de salud deben ser una cadena de texto' })
  datos_salud?: string;
}

export class UpdateSocioDto extends PartialType(CreateSocioDto) {}
