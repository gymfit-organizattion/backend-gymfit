import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateMembresiaDto {
  @IsNotEmpty({ message: 'El id del socio es obligatorio' })
  @IsInt()
  @IsPositive()
  id_socio!: number;

  @IsNotEmpty({ message: 'El id del plan es obligatorio' })
  @IsInt()
  @IsPositive()
  id_plan!: number;

  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener formato YYYY-MM-DD' },
  )
  fecha_inicio!: string;

  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de fin debe tener formato YYYY-MM-DD' },
  )
  fecha_fin!: string;
}

export class UpdateMembresiaDto extends PartialType(CreateMembresiaDto) {
  @IsOptional({ message: 'El estado es opcional' })
  @IsString()
  @MaxLength(20)
  estado?: string;
}
