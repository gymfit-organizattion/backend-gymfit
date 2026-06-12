import {
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateEntrenadorDto {
  @IsOptional({ message: 'El id del usuario es opcional' })
  @IsInt()
  @IsPositive()
  id_usuario?: number;

  @IsOptional({ message: 'La especialidad es opcional' })
  @IsString()
  @MaxLength(100)
  especialidad?: string;

  @IsOptional({ message: 'La experiencia es opcional' })
  @IsInt()
  @Min(0)
  experiencia?: number;
}
