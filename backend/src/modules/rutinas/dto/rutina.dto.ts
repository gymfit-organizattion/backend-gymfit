import {
  IsNotEmpty, IsOptional, IsString, IsInt,
  IsPositive, IsDateString, MaxLength, Min,
  ValidateNested, IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { RutinaEjercicioItemDto } from './rutina-ejercicio.dto';


//  Crear rutina 
export class CreateRutinaDto {
  @IsNotEmpty({ message: 'El nombre de la rutina es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsOptional({ message: 'La descripción es opcional' })
  @IsString()
  descripcion?: string;

  @IsOptional({ message: 'El nivel es opcional' })
  @IsString()
  @MaxLength(50)
  nivel?: string;

  @IsOptional({ message: 'El objetivo es opcional' })
  @IsString()
  @MaxLength(100)
  objetivo?: string;

  @IsOptional({ message: 'Los ejercicios son opcionales' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RutinaEjercicioItemDto)
  ejercicios?: RutinaEjercicioItemDto[];
}

export class UpdateRutinaDto extends PartialType(CreateRutinaDto) {}




