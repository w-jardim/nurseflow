import type { ModalidadeConsultoria } from './consultorias';
import type { ModalidadeCurso } from './cursos';

export type PerfilProfissional = {
  id: string;
  nomePublico: string;
  slug: string;
  bio: string | null;
  telefone: string | null;
  conselho: string | null;
  pixChave: string | null;
  linkPagamento: string | null;
  instrucoesPagamento: string | null;
  plano: string;
  statusAssinatura: string;
  criadoEm: string;
};

export type PaginaPublicaProfissional = {
  id: string;
  nomePublico: string;
  slug: string;
  bio: string | null;
  telefone: string | null;
  conselho: string | null;
  pixChave: string | null;
  linkPagamento: string | null;
  instrucoesPagamento: string | null;
  cursos: Array<{
    id: string;
    titulo: string;
    slug: string;
    descricao: string | null;
    modalidade: ModalidadeCurso;
    precoCentavos: number;
  }>;
  consultorias: Array<{
    id: string;
    titulo: string;
    descricao: string | null;
    modalidade: ModalidadeConsultoria;
    precoCentavos: number;
  }>;
};
