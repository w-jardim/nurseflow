export type Servico = {
  id: string;
  titulo: string;
  descricao: string | null;
  precoCentavos: number;
  exibirPreco: boolean;
  publicado: boolean;
  criadoEm: string;
};
