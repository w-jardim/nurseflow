import { IsEnum } from 'class-validator';
import { PlanoProfissional } from '@prisma/client';

export class CriarAssinaturaDto {
  @IsEnum(PlanoProfissional)
  plano!: PlanoProfissional;
}
