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

export type AulaCurso = {
  id: string;
  titulo: string;
  descricao: string | null;
  videoReferencia: string | null;
  duracaoSegundos: number | null;
  ordem: number;
  criadoEm: string;
};

export type ModuloCurso = {
  id: string;
  titulo: string;
  ordem: number;
  criadoEm: string;
  aulas: AulaCurso[];
};
