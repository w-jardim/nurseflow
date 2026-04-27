import { Body, Controller, Headers, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import * as crypto from 'crypto';
import { PagamentosServico } from './pagamentos.servico';

@Controller('webhooks')
@SkipThrottle()
export class WebhookControlador {
  constructor(
    private readonly pagamentosServico: PagamentosServico,
    private readonly config: ConfigService,
  ) {}

  @Post('mercadopago')
  @HttpCode(200)
  async receberWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('x-signature') assinatura: string,
    @Headers('x-request-id') requestId: string,
  ) {
    const segredo = this.config.get<string>('MERCADO_PAGO_WEBHOOK_SECRET');
    const emProducao = this.config.get<string>('NODE_ENV') === 'production';

    if (emProducao && !segredo) {
      throw new UnauthorizedException('Webhook rejeitado: MERCADO_PAGO_WEBHOOK_SECRET não configurado.');
    }

    if (segredo && assinatura) {
      this.validarAssinatura(body, assinatura, requestId, segredo);
    }

    const tipo = String(body['type'] ?? body['topic'] ?? '');
    await this.pagamentosServico.processarWebhook(tipo, body);

    return { recebido: true };
  }

  private validarAssinatura(
    body: Record<string, unknown>,
    assinatura: string,
    requestId: string,
    segredo: string,
  ) {
    // Formato MP: ts=<timestamp>,v1=<hash>
    const partes = Object.fromEntries(
      assinatura.split(',').map((p) => p.split('=')),
    );
    const ts = partes['ts'];
    const hash = partes['v1'];

    const dataId = String((body['data'] as Record<string, unknown>)?.['id'] ?? '');
    const mensagem = `id:${dataId};request-id:${requestId};ts:${ts};`;

    const hmac = crypto.createHmac('sha256', segredo).update(mensagem).digest('hex');

    if (hmac !== hash) {
      throw new UnauthorizedException('Assinatura do webhook inválida.');
    }
  }
}
