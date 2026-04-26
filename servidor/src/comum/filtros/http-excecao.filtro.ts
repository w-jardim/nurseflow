import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

type RespostaHttp = {
  status: (codigo: number) => RespostaHttp;
  json: (corpo: unknown) => void;
};

const ROTULOS_ERRO: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Requisição inválida',
  [HttpStatus.UNAUTHORIZED]: 'Não autorizado',
  [HttpStatus.FORBIDDEN]: 'Acesso negado',
  [HttpStatus.NOT_FOUND]: 'Não encontrado',
  [HttpStatus.CONFLICT]: 'Conflito',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Dados inválidos',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Muitas requisições',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Erro interno',
};

function obterMensagem(resposta: string | object) {
  if (typeof resposta === 'string') {
    return resposta;
  }

  if ('message' in resposta) {
    return resposta.message;
  }

  return 'Não foi possível concluir a operação.';
}

@Catch(HttpException)
export class HttpExcecaoFiltro implements ExceptionFilter {
  catch(excecao: HttpException, host: ArgumentsHost) {
    const contexto = host.switchToHttp();
    const resposta = contexto.getResponse<RespostaHttp>();
    const statusCode = excecao.getStatus();
    const corpoOriginal = excecao.getResponse();
    const rotuloErro = ROTULOS_ERRO[statusCode] ?? 'Erro';

    resposta.status(statusCode).json({
      statusCode,
      message: obterMensagem(corpoOriginal),
      error: rotuloErro,
    });
  }
}
