export type ModalidadeConsultoria = 'ONLINE' | 'PRESENCIAL';

export type Consultoria = {
  id: string;
  titulo: string;
  descricao: string | null;
  modalidade: ModalidadeConsultoria;
  precoCentavos: number;
  criadoEm: string;
};
