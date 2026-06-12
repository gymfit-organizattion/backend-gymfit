import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAsignacionDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El id del entrenador es obligatorio' })
  @IsInt()
  @IsPositive()
  id_entrenador!: number;

  @ApiProperty({ example: 5 })
  @IsNotEmpty({ message: 'El id del socio es obligatorio' })
  @IsInt()
  @IsPositive()
  id_socio!: number;

  @ApiProperty({ example: '2024-05-15' })
  @IsNotEmpty({ message: 'La fecha de asignación es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha_asignacion!: string;
}

export class BulkAsignacionDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  id_entrenador!: number;

  @ApiProperty({ example: [5, 6, 7] })
  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  id_socios!: number[];

  @ApiProperty({ example: '2024-05-15' })
  @IsNotEmpty()
  @IsDateString()
  fecha_asignacion!: string;
}
