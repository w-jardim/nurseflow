export type StatusCurso = 'RASCUNHO' | 'PUBLICADO' | 'ARQUIVADO';
export type ModalidadeCurso = 'ONLINE' | 'PRESENCIAL';

export type Curso = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  modalidade: ModalidadeCurso;
  precoCentavos: number;
  status: StatusCurso;
  publicadoEm: string | null;
  criadoEm: string;
};

export type InscricaoCurso = {
  id: string;
  cursoId: string;
  alunoId: string;
  criadoEm: string;
  aluno: {
    nome: string;
    sobrenome: string | null;
    email: string;
  };
  acessoAluno: {
    email: string;
    senhaTemporaria: string;
    criadoAgora: boolean;
  } | null;
};

export type CursoAluno = {
  id: string;
  criadoEm: string;
  concluidoEm: string | null;
  curso: Curso & {
    profissional: {
      nomePublico: string;
    };
    _count: {
      modulos: number;
    };
  };
};

export type CursoAlunoDetalhe = Omit<CursoAluno, 'curso'> & {
  curso: Curso & {
    profissional: {
      nomePublico: string;
    };
    modulos: ModuloCurso[];
  };
};

export type AulaCurso = {
  id: string;
  titulo: string;
  descricao: string | null;
  videoReferencia: string | null;
  duracaoSegundos: number | null;
  ordem: number;
  criadoEm: string;
  progressos?: {
    concluida: boolean;
    atualizadoEm: string;
  }[];
};

export type ProgressoAula = {
  id: string;
  aulaId: string;
  concluida: boolean;
  atualizadoEm: string;
  cursoConcluido: boolean;
  concluidoEm: string | null;
};

export type ModuloCurso = {
  id: string;
  titulo: string;
  ordem: number;
  criadoEm: string;
  aulas: AulaCurso[];
};
