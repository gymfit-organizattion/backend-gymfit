import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CambiarPasswordDto {
  @ApiProperty({
    example: 'passwordAnterior123',
    description:
      'Contraseña actual del usuario — se verifica con bcrypt antes de permitir el cambio',
  })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  @IsString()
  password_actual!: string;

  @ApiProperty({
    example: 'nuevaPassword456',
    description:
      'Nueva contraseña (mínimo 8 caracteres, no puede ser igual a la actual)',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'La contraseña nueva es obligatoria' })
  @IsString()
  @MinLength(8, {
    message: 'La contraseña nueva debe tener mínimo 8 caracteres',
  })
  password_nueva!: string;
}
