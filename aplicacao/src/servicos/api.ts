import { configuracao } from '../configuracao';
import { buscarToken } from './sessao';

type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type OpcoesRequisicao = {
  metodo?: MetodoHttp;
  corpo?: unknown;
  autenticada?: boolean;
};

export async function requisitarApi<TResposta>(
  caminho: string,
  { metodo = 'GET', corpo, autenticada = false }: OpcoesRequisicao = {},
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

  const conteudo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagem =
      conteudo?.message ?? conteudo?.mensagem ?? 'Não foi possível concluir a operação.';
    throw new Error(Array.isArray(mensagem) ? mensagem.join(', ') : mensagem);
  }

  return conteudo as TResposta;
}
