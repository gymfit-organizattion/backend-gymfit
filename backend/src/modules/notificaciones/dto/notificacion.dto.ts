import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateNotificacionDto {
  @IsOptional()
  @IsNumber()
  id_usuario?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  tipo!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  titulo!: string;

  @IsNotEmpty()
  @IsString()
  mensaje!: string;

  @IsOptional()
  @IsNumber()
  referencia_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  referencia_tipo?: string;
}

export class UpdateNotificacionDto extends PartialType(CreateNotificacionDto) {
  @IsOptional()
  @IsBoolean()
  leida?: boolean;
}

export class MarcarLeidaDto {
  @IsOptional()
  @IsNumber({}, { each: true })
  ids?: number[]; // Si vacío, marca todas las del usuario como leídas
}
