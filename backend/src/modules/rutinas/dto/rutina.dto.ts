import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  MaxLength,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { RutinaEjercicioItemDto } from './rutina-ejercicio.dto';

//  Crear rutina (RF-011)
export class CreateRutinaDto {
  @IsNotEmpty({ message: 'El nombre de la rutina es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nivel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  objetivo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RutinaEjercicioItemDto)
  ejercicios?: RutinaEjercicioItemDto[];
}

export class UpdateRutinaDto extends PartialType(CreateRutinaDto) {}
