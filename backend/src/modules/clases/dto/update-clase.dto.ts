import {
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  MaxLength,
  IsDate,
} from 'class-validator';

export class UpdateClaseDto {
  @IsOptional({ message: 'El nombre de la clase es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional({ message: 'El horario es obligatorio' })
  @IsDate()
  horario?: Date;

  @IsOptional({ message: 'El cupo es obligatorio' })
  @IsInt()
  @IsPositive({ message: 'El cupo debe ser mayor a 0' })
  cupo?: number;

  @IsOptional({ message: 'El id del entrenador es obligatorio' })
  @IsInt()
  @IsPositive()
  id_entrenador?: number;
}
