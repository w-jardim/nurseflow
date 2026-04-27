export type ModalidadeConsultoria = 'ONLINE' | 'PRESENCIAL';
export type StatusConsultoria = 'AGENDADA' | 'CONFIRMADA' | 'CANCELADA' | 'CONCLUIDA';

export type Consultoria = {
  id: string;
  titulo: string;
  descricao: string | null;
  modalidade: ModalidadeConsultoria;
  precoCentavos: number;
  inicioEm: string | null;
  fimEm: string | null;
  status: StatusConsultoria;
  observacoes: string | null;
  criadoEm: string;
};
