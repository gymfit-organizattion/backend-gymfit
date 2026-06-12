import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEquipoDto {
  @IsNotEmpty({ message: 'El nombre del equipo es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  codigo_barras?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  estado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ubicacion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  cantidad?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  stock_minimo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El stock máximo no puede ser negativo' })
  stock_maximo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  precio_unitario?: number;
}

export class UpdateEquipoDto extends PartialType(CreateEquipoDto) {}
