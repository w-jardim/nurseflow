export type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: 'SUPER_ADMIN' | 'PROFISSIONAL' | 'ALUNO' | 'PACIENTE';
  profissionalId: string | null;
  ativo: boolean;
  criadoEm: string;
};

export type Profissional = {
  id: string;
  nomePublico: string;
  slug: string;
  plano: string;
  statusAssinatura: string;
};

export type RespostaAutenticacao = {
  usuario: Usuario;
  profissional?: Profissional;
  acesso: {
    token: string;
    tipo: 'Bearer';
    expiraEmSegundos: number;
  };
  refreshToken: {
    token: string;
    expiraEmSegundos: number;
  };
};
