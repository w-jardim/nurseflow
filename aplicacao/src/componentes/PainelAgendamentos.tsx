import { useState } from 'react';
import { Badge } from './ui/Badge';
import { Botao } from './ui/Botao';
import { EstadoVazio } from './ui/EstadoVazio';
import { useToast } from '../contextos/ToastContexto';
import { requisitarApi } from '../servicos/api';
import type { SolicitacaoAgendamento, StatusSolicitacao } from '../tipos/agendamentos';

type Props = {
  solicitacoes: SolicitacaoAgendamento[];
  aoAtualizar: () => void;
};

const COR_STATUS: Record<StatusSolicitacao, 'amarelo' | 'verde' | 'vermelho'> = {
  PENDENTE: 'amarelo',
  CONFIRMADA: 'verde',
  CANCELADA: 'vermelho',
};

const LABEL_STATUS: Record<StatusSolicitacao, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { dateStyle: 'long' });
}

function CartaoSolicitacao({
  solicitacao,
  aoAtualizar,
}: {
  solicitacao: SolicitacaoAgendamento;
  aoAtualizar: () => void;
}) {
  const toast = useToast();
  const [atualizando, setAtualizando] = useState(false);

  async function atualizarStatus(status: StatusSolicitacao) {
    setAtualizando(true);
    try {
      await requisitarApi(`/agendamentos/${solicitacao.id}`, {
        metodo: 'PATCH',
        autenticada: true,
        corpo: { status },
      });
      aoAtualizar();
      toast(status === 'CONFIRMADA' ? 'Solicitação confirmada.' : 'Solicitação cancelada.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível atualizar.', 'erro');
    } finally {
      setAtualizando(false);
    }
  }

  const iniciais = solicitacao.nome
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-primario">
          {iniciais}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-950">{solicitacao.nome}</h3>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <Badge cor="azul">{solicitacao.email}</Badge>
                {solicitacao.telefone && <Badge cor="ciano">{solicitacao.telefone}</Badge>}
              </div>
            </div>
            <Badge cor={COR_STATUS[solicitacao.status]}>{LABEL_STATUS[solicitacao.status]}</Badge>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatarData(solicitacao.dataDesejada)}
            </span>
            {solicitacao.horarioDesejado && (
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {solicitacao.horarioDesejado}
              </span>
            )}
          </div>

          {solicitacao.observacoes && (
            <p className="mt-2 text-sm text-slate-500 italic">"{solicitacao.observacoes}"</p>
          )}

          <p className="mt-2 text-xs text-slate-400">
            Recebido em {new Date(solicitacao.criadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
          </p>

          {solicitacao.status === 'PENDENTE' && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Botao
                tamanho="sm"
                onClick={() => atualizarStatus('CONFIRMADA')}
                carregando={atualizando}
              >
                Confirmar
              </Botao>
              <Botao
                tamanho="sm"
                variante="perigo"
                onClick={() => atualizarStatus('CANCELADA')}
                carregando={atualizando}
              >
                Cancelar
              </Botao>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function PainelAgendamentos({ solicitacoes, aoAtualizar }: Props) {
  const [filtro, setFiltro] = useState<StatusSolicitacao | 'TODOS'>('TODOS');

  const visiveis =
    filtro === 'TODOS' ? solicitacoes : solicitacoes.filter((s) => s.status === filtro);

  const contagens = {
    TODOS: solicitacoes.length,
    PENDENTE: solicitacoes.filter((s) => s.status === 'PENDENTE').length,
    CONFIRMADA: solicitacoes.filter((s) => s.status === 'CONFIRMADA').length,
    CANCELADA: solicitacoes.filter((s) => s.status === 'CANCELADA').length,
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {solicitacoes.length} solicitaç{solicitacoes.length !== 1 ? 'ões' : 'ão'} recebida{solicitacoes.length !== 1 ? 's' : ''}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Clientes que solicitaram agendamento pela sua página pública.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['TODOS', 'PENDENTE', 'CONFIRMADA', 'CANCELADA'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filtro === f
                    ? 'bg-primario text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                type="button"
              >
                {f === 'TODOS' ? 'Todos' : LABEL_STATUS[f]} ({contagens[f]})
              </button>
            ))}
          </div>
        </div>

        {solicitacoes.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma solicitação ainda"
            descricao="Quando um cliente solicitar agendamento pela sua página pública, aparecerá aqui."
            icone={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        ) : visiveis.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Nenhuma solicitação com este status.
          </div>
        ) : (
          <ul className="grid gap-3 p-4 xl:grid-cols-2">
            {visiveis.map((s) => (
              <CartaoSolicitacao key={s.id} solicitacao={s} aoAtualizar={aoAtualizar} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
