import { useEffect, useState } from 'react';
import { PainelConsultas } from '../../componentes/PainelConsultas';
import { requisitarApi } from '../../servicos/api';
import type { Consulta, StatusConsulta } from '../../tipos/consultas';
import type { Consultoria } from '../../tipos/consultorias';
import type { Contato } from '../../tipos/contatos';

export function PaginaConsultas() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [consultorias, setConsultorias] = useState<Consultoria[]>([]);
  const [pacientes, setPacientes] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    Promise.all([
      requisitarApi<Consulta[]>('/consultas', { autenticada: true }),
      requisitarApi<Consultoria[]>('/consultorias', { autenticada: true }),
      requisitarApi<Contato[]>('/pacientes', { autenticada: true }),
    ])
      .then(([c, cs, p]) => { setConsultas(c); setConsultorias(cs); setPacientes(p); })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function criarConsulta(dados: {
    pacienteId: string; inicioEm: string; fimEm: string;
    status: StatusConsulta; observacoes: string; permitirSobreposicao: boolean;
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
        permitirSobreposicao: dados.permitirSobreposicao,
      },
    });
    setConsultas((c) => [...c, consulta].sort((a, b) => a.inicioEm.localeCompare(b.inicioEm)));
  }

  if (carregando) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return <PainelConsultas pacientes={pacientes} consultas={consultas} consultorias={consultorias} aoCriar={criarConsulta} />;
}
