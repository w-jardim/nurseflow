export type StatusConsulta = 'AGENDADA' | 'CONFIRMADA' | 'CANCELADA' | 'CONCLUIDA';

export type Consulta = {
  id: string;
  inicioEm: string;
  fimEm: string;
  status: StatusConsulta;
  observacoes: string | null;
  criadoEm: string;
  paciente: {
    id: string;
    nome: string;
    sobrenome: string | null;
    telefone: string | null;
    email: string | null;
  };
};
