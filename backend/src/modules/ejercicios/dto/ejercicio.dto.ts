import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateEjercicioDto {
  @IsNotEmpty({ message: 'El nombre del ejercicio es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsOptional({ message: 'La descripción del ejercicio es opcional' })
  @IsString()
  descripcion?: string;

  @IsOptional({ message: 'El grupo muscular es opcional' })
  @IsString()
  @MaxLength(50)
  grupo_muscular?: string;
}

export class UpdateEjercicioDto extends PartialType(CreateEjercicioDto) {}
