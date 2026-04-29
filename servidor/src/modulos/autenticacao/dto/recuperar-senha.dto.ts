import { IsEmail, IsString, MaxLength } from 'class-validator';

export class RecuperarSenhaDto {
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email!: string;
}
