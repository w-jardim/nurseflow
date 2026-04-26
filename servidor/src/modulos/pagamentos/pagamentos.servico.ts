import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlanoProfissional, StatusAssinatura, StatusPagamento } from '@prisma/client';
import { PrismaServico } from '../../comum/prisma/prisma.servico';

const VALORES_PLANO: Record<PlanoProfissional, number> = {
  GRATUITO: 0,
  PRO: 7990,
  STANDARD: 14990,
};

const TAXA_PLATAFORMA = 0.05;
const MERCADO_PAGO_API = 'https://api.mercadopago.com';

type MercadoPagoAssinatura = {
  id?: string;
  init_point?: string;
  status?: string;
};

type MercadoPagoPreferencia = {
  id?: string;
  init_point?: string;
};

type MercadoPagoPagamento = {
  external_reference?: string;
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

  async criarPagamentoCurso(profissionalId: string, cursoId: string, alunoId: string) {
    this.validarMercadoPagoConfigurado();

    const [curso, aluno] = await Promise.all([
      this.prisma.curso.findFirst({
        where: { id: cursoId, profissionalId, excluidoEm: null },
      }),
      this.prisma.aluno.findFirst({
        where: { id: alunoId, profissionalId, excluidoEm: null },
        include: { usuario: true },
      }),
    ]);

    if (!curso) throw new NotFoundException('Curso não encontrado.');
    if (!aluno) throw new NotFoundException('Aluno não encontrado.');

    const jaInscrito = await this.prisma.inscricaoCurso.findUnique({
      where: { cursoId_alunoId: { cursoId, alunoId } },
    });
    if (jaInscrito) throw new BadRequestException('Aluno já está inscrito neste curso.');

    if (curso.precoCentavos === 0) {
      const inscricao = await this.prisma.inscricaoCurso.create({
        data: { profissionalId, cursoId, alunoId },
      });
      return { gratuito: true, inscricaoId: inscricao.id };
    }

    const taxaCentavos = Math.round(curso.precoCentavos * TAXA_PLATAFORMA);

    const transacao = await this.prisma.transacao.create({
      data: {
        profissionalId,
        valorCentavos: curso.precoCentavos,
        taxaPlataformaCentavos: taxaCentavos,
        status: StatusPagamento.PENDENTE,
      },
    });

    const baseUrl = this.config.get('APLICACAO_URL', 'http://localhost:5173');

    const resultado = await this.requisitarMercadoPago<MercadoPagoPreferencia>(
      '/checkout/preferences',
      {
        method: 'POST',
        items: [
          {
            id: cursoId,
            title: curso.titulo,
            quantity: 1,
            unit_price: curso.precoCentavos / 100,
            currency_id: 'BRL',
          },
        ],
        payer: aluno.email
          ? { email: aluno.email }
          : undefined,
        external_reference: transacao.id,
        notification_url: `${this.config.get('APLICACAO_URL', 'http://localhost:3000')}/webhooks/mercadopago`,
        back_urls: {
          success: `${baseUrl}/cursos/${cursoId}/sucesso`,
          failure: `${baseUrl}/cursos/${cursoId}/falha`,
          pending: `${baseUrl}/cursos/${cursoId}/pendente`,
        },
        auto_return: 'approved',
      },
    );

    await this.prisma.transacao.update({
      where: { id: transacao.id },
      data: { mercadoPagoReferencia: resultado.id },
    });

    return { urlPagamento: resultado.init_point, transacaoId: transacao.id };
  }

  async processarWebhook(tipo: string, dados: Record<string, unknown>) {
    if (tipo === 'payment') {
      await this.processarPagamento(this.extrairIdEvento(dados));
    } else if (tipo === 'subscription_preapproval') {
      await this.processarAssinatura(this.extrairIdEvento(dados));
    }
  }

  private async processarPagamento(pagamentoId: string) {
    const pagamento = await this.requisitarMercadoPago<MercadoPagoPagamento>(
      `/v1/payments/${pagamentoId}`,
    );

    const transacaoId = pagamento.external_reference;
    if (!transacaoId) return;

    const status = this.mapearStatusPagamento(pagamento.status ?? '');

    await this.prisma.transacao.update({
      where: { id: transacaoId },
      data: { status },
    });

    if (status === StatusPagamento.APROVADO) {
      const transacao = await this.prisma.transacao.findUnique({
        where: { id: transacaoId },
        include: { inscricao: true },
      });
      if (transacao && !transacao.inscricao) {
        // Cria inscrição automaticamente após pagamento aprovado
        // O cursoId e alunoId precisam estar na transação - busca via preferência
        // Neste ponto aguardamos o webhook conter os dados necessários
      }
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

  private mapearStatusPagamento(status: string): StatusPagamento {
    const mapa: Record<string, StatusPagamento> = {
      approved: StatusPagamento.APROVADO,
      rejected: StatusPagamento.RECUSADO,
      refunded: StatusPagamento.ESTORNADO,
      charged_back: StatusPagamento.ESTORNADO,
    };
    return mapa[status] ?? StatusPagamento.PENDENTE;
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
