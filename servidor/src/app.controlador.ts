import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppControlador {
  @Get('saude')
  verificarSaude() {
    return {
      nome: 'NurseFlow API',
      status: 'ok',
      data: new Date().toISOString(),
    };
  }
}
