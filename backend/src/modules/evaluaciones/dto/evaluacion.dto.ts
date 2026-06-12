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

export class CreateEvaluacionDto {
  @IsNotEmpty({ message: 'El id del socio es obligatorio' })
  @IsInt()
  @IsPositive()
  id_socio!: number;

  @IsNotEmpty({ message: 'El peso es obligatorio' })
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsPositive({ message: 'El peso debe ser mayor a 0' })
  peso!: number;

  @IsOptional({ message: 'La grasa corporal es opcional' })
  @IsNumber({}, { message: 'La grasa corporal debe ser un número' })
  @IsPositive({ message: 'La grasa corporal debe ser mayor a 0' })
  grasa?: number;

  @IsOptional({ message: 'Las medidas son opcionales' })
  @IsString()
  medidas?: string;

  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha!: string;
}

export class UpdateEvaluacionDto extends PartialType(CreateEvaluacionDto) {}
