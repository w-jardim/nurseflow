export type LogAuditoria = {
  id: string;
  acao: string;
  entidade: string | null;
  entidadeId: string | null;
  metadados: Record<string, unknown> | null;
  criadoEm: string;
};
