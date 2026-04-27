import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlanoProfissional, StatusAssinatura } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';

const VALORES_PLANO: Record<PlanoProfissional, number> = {
  GRATUITO: 0,
  PRO: 7990,
  STANDARD: 14990,
};

const MERCADO_PAGO_API = 'https://api.mercadopago.com';

type MercadoPagoAssinatura = {
  id?: string;
  init_point?: string;
  status?: string;
};

@Injectable()
export class PagamentosServico {
  constructor(
    private readonly prisma: PrismaServico,
    private readonly config: ConfigService,
  ) {}

  async criarAssinatura(profissionalId: string, plano: PlanoProfissional) {
    if (plano === 'GRATUITO') {
      throw new BadRequestException('Plano gratuito não requer assinatura.');
    }
    this.validarMercadoPagoConfigurado();

    const profissional = await this.prisma.profissional.findUnique({
      where: { id: profissionalId },
      include: { usuarioDono: true },
    });

    if (!profissional) throw new NotFoundException('Profissional não encontrado.');

    const valorCentavos = VALORES_PLANO[plano];

    const resultado = await this.requisitarMercadoPago<MercadoPagoAssinatura>(
      '/preapproval',
      {
        method: 'POST',
        reason: `NurseFlow - Plano ${plano}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: valorCentavos / 100,
          currency_id: 'BRL',
        },
        payer_email: profissional.usuarioDono.email,
        back_url: `${this.config.get('APLICACAO_URL', 'http://localhost:5173')}/painel/assinatura`,
        status: 'pending',
      },
    );

    await this.prisma.assinatura.create({
      data: {
        profissionalId,
        plano,
        status: StatusAssinatura.ATIVA,
        mercadoPagoReferencia: String(resultado.id),
      },
    });

    return { urlPagamento: resultado.init_point, referencia: resultado.id };
  }

  async processarWebhook(tipo: string, dados: Record<string, unknown>) {
    if (tipo === 'subscription_preapproval') {
      await this.processarAssinatura(this.extrairIdEvento(dados));
    }
  }

  private async processarAssinatura(preApprovalId: string) {
    const assinatura = await this.requisitarMercadoPago<MercadoPagoAssinatura>(
      `/preapproval/${preApprovalId}`,
    );

    const registro = await this.prisma.assinatura.findFirst({
      where: { mercadoPagoReferencia: preApprovalId },
    });
    if (!registro) return;

    const statusMP = assinatura.status;
    const novoStatus =
      statusMP === 'authorized'
        ? StatusAssinatura.ATIVA
        : statusMP === 'paused'
          ? StatusAssinatura.INADIMPLENTE
          : StatusAssinatura.CANCELADA;

    await this.prisma.$transaction([
      this.prisma.assinatura.update({
        where: { id: registro.id },
        data: {
          status: novoStatus,
          canceladoEm: novoStatus === StatusAssinatura.CANCELADA ? new Date() : undefined,
        },
      }),
      this.prisma.profissional.update({
        where: { id: registro.profissionalId },
        data: {
          statusAssinatura: novoStatus,
          plano: novoStatus === StatusAssinatura.ATIVA ? registro.plano : PlanoProfissional.GRATUITO,
        },
      }),
    ]);
  }

  private extrairIdEvento(dados: Record<string, unknown>) {
    const dadosEvento = dados['data'] as Record<string, unknown> | undefined;
    return String(dadosEvento?.['id'] ?? dados['id'] ?? '');
  }

  private validarMercadoPagoConfigurado() {
    if (!this.config.get<string>('MERCADO_PAGO_ACCESS_TOKEN')) {
      throw new ServiceUnavailableException('Mercado Pago não configurado.');
    }
  }

  private async requisitarMercadoPago<T>(
    caminho: string,
    opcoes?: { method?: 'GET' | 'POST'; [chave: string]: unknown },
  ): Promise<T> {
    this.validarMercadoPagoConfigurado();

    const { method = 'GET', ...body } = opcoes ?? {};
    const resposta = await fetch(`${MERCADO_PAGO_API}${caminho}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.config.get<string>('MERCADO_PAGO_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: method === 'GET' ? undefined : JSON.stringify(body),
    });

    if (!resposta.ok) {
      throw new ServiceUnavailableException('Mercado Pago indisponível no momento.');
    }

    return resposta.json() as Promise<T>;
  }

  async buscarAssinatura(profissionalId: string) {
    return this.prisma.assinatura.findFirst({
      where: { profissionalId },
      orderBy: { criadoEm: 'desc' },
    });
  }
}
