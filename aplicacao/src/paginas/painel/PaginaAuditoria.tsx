import { useEffect, useState } from 'react';
import { PainelAuditoria } from '../../componentes/PainelAuditoria';
import { requisitarApi } from '../../servicos/api';
import type { LogAuditoria } from '../../tipos/auditoria';

export function PaginaAuditoria() {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisitarApi<LogAuditoria[]>('/auditoria', { autenticada: true })
      .then(setLogs)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return <PainelAuditoria logs={logs} />;
}
