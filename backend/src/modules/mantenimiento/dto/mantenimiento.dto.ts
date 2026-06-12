import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateMantenimientoDto {
  @IsNotEmpty({ message: 'El id del equipo es obligatorio' })
  @IsInt()
  @IsPositive()
  id_equipo!: number;

  @IsOptional({ message: 'El id del usuario es opcional' })
  @IsInt()
  @IsPositive()
  id_usuario?: number;

  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha!: string;

  @IsOptional({ message: 'La descripción es opcional' })
  @IsString()
  descripcion?: string;
}

export class UpdateMantenimientoDto extends PartialType(
  CreateMantenimientoDto,
) {}
