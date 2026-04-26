export type MetricasAdmin = {
  receita: {
    mrrCentavos: number;
    arrCentavos: number;
    volumeTransacoesCentavos: number;
    taxaPlataformaCentavos: number;
  };
  assinaturas: {
    churnRate30Dias: number;
    canceladas30Dias: number;
  };
  profissionais: {
    total: number;
    novosMesAtual: number;
    novos30Dias: number;
    porPlano: { GRATUITO: number; PRO: number; STANDARD: number };
  };
  usuarios: { totalAlunos: number; totalPacientes: number };
};

export type ProfissionalAdmin = {
  id: string;
  nomePublico: string;
  slug: string;
  plano: string;
  statusAssinatura: string;
  criadoEm: string;
  usuarioDono: { email: string; ultimoAcessoEm: string | null };
  _count: { alunos: number; pacientes: number; cursos: number };
};

export type ListaPaginada<T> = {
  dados: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
};
