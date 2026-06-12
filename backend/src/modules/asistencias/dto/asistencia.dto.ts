import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

//   registrar asistencia por id_socio
export class CreateAsistenciaDto {
  @IsNotEmpty({ message: 'El id del socio es obligatorio' })
  @IsInt()
  @IsPositive()
  id_socio!: number;
}

//  validar acceso por identificación del usuario
export class ValidarAccesoDto {
  @IsNotEmpty({ message: 'La identificación es obligatoria' })
  @IsString()
  @MaxLength(50)
  identificacion!: string;
}

//  Respuesta de validación de acceso
export interface RespuestaAcceso {
  acceso: boolean; // true = puede entrar, false = denegado
  color: 'verde' | 'rojo'; // indicador visual para recepción (HU-16)
  motivo: string; // descripción legible del resultado
  socio?: {
    id_socio: number;
    nombre: string;
    identificacion: string;
  };
  membresia?: {
    id_membresia: number;
    plan: string;
    fecha_fin: string;
    estado: string;
    dias_restantes: number;
  };
  asistencia_registrada?: boolean; // si acceso=true, la asistencia se guarda automáticamente
}
