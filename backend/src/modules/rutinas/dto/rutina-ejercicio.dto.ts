import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  MaxLength,
  Min,
} from 'class-validator';

export class RutinaEjercicioItemDto {
  @IsNotEmpty({ message: 'El id del ejercicio es obligatorio' })
  @IsInt()
  @IsPositive()
  id_ejercicio!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  series?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  repeticiones?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  descanso?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}

/** DTO para actualizaciones parciales (PATCH) — id_ejercicio no requerido */
export class UpdateRutinaEjercicioDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  series?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  repeticiones?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  descanso?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
