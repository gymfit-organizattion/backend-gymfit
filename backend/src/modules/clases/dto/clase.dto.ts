import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsPositive,
  MaxLength,
} from 'class-validator';

export class CreateClaseDto {
  @IsNotEmpty({ message: 'El nombre de la clase es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsNotEmpty({ message: 'El horario es obligatorio' })
  horario!: Date;

  @IsNotEmpty({ message: 'El cupo es obligatorio' })
  @IsInt()
  @IsPositive({ message: 'El cupo debe ser mayor a 0' })
  cupo!: number;

  @IsNotEmpty({ message: 'El id del entrenador es obligatorio' })
  @IsInt()
  @IsPositive()
  id_entrenador!: number;
}
