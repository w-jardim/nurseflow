export type StatusCurso = 'RASCUNHO' | 'PUBLICADO' | 'ARQUIVADO';

export type Curso = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  precoCentavos: number;
  status: StatusCurso;
  publicadoEm: string | null;
  criadoEm: string;
};
