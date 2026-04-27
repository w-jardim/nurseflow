import { useCallback, useEffect, useState } from 'react';
import { requisitarApi } from '../../servicos/api';
import { PainelAgendamentos } from '../../componentes/PainelAgendamentos';
import { Esqueleto } from '../../componentes/ui/Esqueleto';
import type { SolicitacaoAgendamento } from '../../tipos/agendamentos';

export function PaginaAgendamentos() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAgendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro('');
    requisitarApi<SolicitacaoAgendamento[]>('/agendamentos', { autenticada: true })
      .then(setSolicitacoes)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar solicitações.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) {
    return (
      <div className="space-y-3">
        <Esqueleto className="h-8 w-48" />
        <Esqueleto className="h-48" />
        <Esqueleto className="h-48" />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        {erro}
      </div>
    );
  }

  return <PainelAgendamentos solicitacoes={solicitacoes} aoAtualizar={carregar} />;
}
