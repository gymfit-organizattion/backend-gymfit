import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsPositive,
  IsDateString,
} from 'class-validator';

export class CreateEntrenadorDto {
  @IsNotEmpty({ message: 'El id del usuario es obligatorio' })
  @IsInt()
  @IsPositive()
  id_usuario!: number;

  @IsOptional({ message: 'La especialidad es opcional' })
  @IsString()
  @MaxLength(100)
  especialidad?: string;

  @IsOptional({ message: 'La experiencia es opcional' })
  @IsInt()
  @Min(0)
  experiencia?: number;
}
