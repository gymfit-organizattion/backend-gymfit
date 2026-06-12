import { PartialType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAlertaStockDto {
  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  @IsNumber()
  id_equipo!: number;

  @IsNotEmpty({ message: 'El tipo de alerta es obligatorio' })
  @IsEnum(['bajo_stock', 'sobre_stock', 'agotado'])
  tipo!: 'bajo_stock' | 'sobre_stock' | 'agotado';

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNotEmpty({ message: 'La cantidad actual es obligatoria' })
  @IsNumber()
  cantidad_actual!: number;

  @IsNotEmpty({ message: 'La cantidad esperada es obligatoria' })
  @IsNumber()
  cantidad_esperada!: number;
}

export class UpdateAlertaStockDto extends PartialType(CreateAlertaStockDto) {
  @IsOptional()
  @IsString()
  estado?: string;
}

export class ResolverAlertaStockDto {
  @IsNotEmpty({ message: 'El nuevo estado es obligatorio' })
  @IsEnum(['resuelta', 'ignorada'])
  estado!: 'resuelta' | 'ignorada';

  @IsOptional()
  @IsString()
  nota?: string;
}
