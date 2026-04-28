import { configuracao } from '../configuracao';
import type { RespostaAutenticacao } from '../tipos/autenticacao';
import { buscarRefreshToken, buscarToken, limparSessao, salvarSessao } from './sessao';

type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type OpcoesRequisicao = {
  metodo?: MetodoHttp;
  corpo?: unknown;
  autenticada?: boolean;
  ignorarRefreshAutomatico?: boolean;
};

export async function requisitarApi<TResposta>(
  caminho: string,
  { metodo = 'GET', corpo, autenticada = false, ignorarRefreshAutomatico = false }: OpcoesRequisicao = {},
): Promise<TResposta> {
  return executarRequisicao<TResposta>(caminho, {
    metodo,
    corpo,
    autenticada,
    ignorarRefreshAutomatico,
  });
}

async function executarRequisicao<TResposta>(
  caminho: string,
  { metodo, corpo, autenticada, ignorarRefreshAutomatico }: Required<OpcoesRequisicao>,
): Promise<TResposta> {
  const cabecalhos: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (autenticada) {
    const token = buscarToken();

    if (token) {
      cabecalhos.Authorization = `Bearer ${token}`;
    }
  }

  const resposta = await fetch(`${configuracao.apiUrl}${caminho}`, {
    method: metodo,
    headers: cabecalhos,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  if (resposta.status === 401 && autenticada && !ignorarRefreshAutomatico) {
    const renovou = await tentarRenovarSessao();

    if (renovou) {
      return executarRequisicao<TResposta>(caminho, {
        metodo,
        corpo,
        autenticada,
        ignorarRefreshAutomatico: true,
      });
    }
  }

  const conteudo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagem =
      conteudo?.message ?? conteudo?.mensagem ?? 'Não foi possível concluir a operação.';
    throw new Error(Array.isArray(mensagem) ? mensagem.join(', ') : mensagem);
  }

  return conteudo as TResposta;
}

async function tentarRenovarSessao() {
  const refreshToken = buscarRefreshToken();

  if (!refreshToken) {
    limparSessao();
    return false;
  }

  try {
    const resposta = await executarRequisicao<RespostaAutenticacao>('/autenticacao/refresh', {
      metodo: 'POST',
      corpo: { refreshToken },
      autenticada: false,
      ignorarRefreshAutomatico: true,
    });

    salvarSessao(resposta);
    return true;
  } catch {
    limparSessao();
    return false;
  }
}
