import { IsBoolean } from 'class-validator';

export class AtualizarProgressoAulaDto {
  @IsBoolean()
  concluida!: boolean;
}
