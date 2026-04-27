export type StatusSolicitacao = 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA';

export type SolicitacaoAgendamento = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  dataDesejada: string;
  horarioDesejado: string | null;
  observacoes: string | null;
  status: StatusSolicitacao;
  criadoEm: string;
};
