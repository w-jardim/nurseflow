export type ModalidadeConsultoria = 'ONLINE' | 'PRESENCIAL';
export type StatusConsultoria = 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA';

export type Consultoria = {
  id: string;
  titulo: string;
  descricao: string | null;
  modalidade: ModalidadeConsultoria;
  status: StatusConsultoria;
  inicioEm: string | null;
  fimEm: string | null;
  local: string | null;
  linkOnline: string | null;
  criadoEm: string;
  aluno: {
    id: string;
    nome: string;
    sobrenome: string | null;
  } | null;
  paciente: {
    id: string;
    nome: string;
    sobrenome: string | null;
  } | null;
};
