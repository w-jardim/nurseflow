export const PLANOS = ['GRATUITO', 'PRO', 'STANDARD'] as const;

export type Plano = (typeof PLANOS)[number];

export const limitesPorPlano = {
  GRATUITO: {
    alunos: 3,
    pacientes: 3,
    cursos: 1,
    agendamentosMensais: 5,
    armazenamentoGb: 0,
  },
  PRO: {
    alunos: 100,
    pacientes: 50,
    cursos: 5,
    agendamentosMensais: null,
    armazenamentoGb: 5,
  },
  STANDARD: {
    alunos: null,
    pacientes: null,
    cursos: null,
    agendamentosMensais: null,
    armazenamentoGb: 50,
  },
} satisfies Record<Plano, Record<string, number | null>>;
