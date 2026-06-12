import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsDateString,
  MaxLength,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

//  Asignar rutina a socio
export class CreateAsignacionRutinaDto {
  @IsNotEmpty({ message: 'El id de la rutina es obligatorio' })
  @IsInt()
  @IsPositive()
  id_rutina!: number;

  @IsNotEmpty({ message: 'El id del socio es obligatorio' })
  @IsInt()
  @IsPositive()
  id_socio!: number;

  @IsNotEmpty({ message: 'La fecha de asignación es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha_asignacion!: string;
}
