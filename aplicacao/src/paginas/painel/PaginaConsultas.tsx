import { useEffect, useState } from 'react';
import { PainelConsultas } from '../../componentes/PainelConsultas';
import { requisitarApi } from '../../servicos/api';
import type { Consulta, StatusConsulta } from '../../tipos/consultas';
import type { Contato } from '../../tipos/contatos';

export function PaginaConsultas() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pacientes, setPacientes] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    Promise.all([
      requisitarApi<Consulta[]>('/consultas', { autenticada: true }),
      requisitarApi<Contato[]>('/pacientes', { autenticada: true }),
    ])
      .then(([c, p]) => { setConsultas(c); setPacientes(p); })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function criarConsulta(dados: {
    pacienteId: string; inicioEm: string; fimEm: string;
    status: StatusConsulta; observacoes: string;
  }) {
    const consulta = await requisitarApi<Consulta>('/consultas', {
      metodo: 'POST',
      autenticada: true,
      corpo: {
        pacienteId: dados.pacienteId,
        inicioEm: dados.inicioEm,
        fimEm: dados.fimEm,
        status: dados.status,
        observacoes: dados.observacoes || undefined,
      },
    });
    setConsultas((c) => [...c, consulta].sort((a, b) => a.inicioEm.localeCompare(b.inicioEm)));
  }

  if (carregando) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return <PainelConsultas pacientes={pacientes} consultas={consultas} aoCriar={criarConsulta} />;
}
