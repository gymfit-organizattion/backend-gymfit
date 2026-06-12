import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProgresoDto {
  @IsNotEmpty({ message: 'El id del socio es obligatorio' })
  @IsInt()
  @IsPositive()
  id_socio!: number;

  @IsOptional({ message: 'El peso es opcional' })
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsPositive({ message: 'El peso debe ser mayor a 0' })
  peso?: number;

  @IsOptional({ message: 'Las observaciones son opcionales' })
  @IsString()
  observaciones?: string;

  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha!: string;
}

export class UpdateProgresoDto extends PartialType(CreateProgresoDto) {}
