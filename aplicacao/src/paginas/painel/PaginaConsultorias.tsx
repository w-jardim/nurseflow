import { useEffect, useState } from 'react';
import { PainelConsultorias } from '../../componentes/PainelConsultorias';
import { requisitarApi } from '../../servicos/api';
import type { Consulta } from '../../tipos/consultas';
import type { Consultoria, ModalidadeConsultoria } from '../../tipos/consultorias';

export function PaginaConsultorias() {
  const [consultorias, setConsultorias] = useState<Consultoria[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    Promise.all([
      requisitarApi<Consultoria[]>('/consultorias', { autenticada: true }),
      requisitarApi<Consulta[]>('/consultas', { autenticada: true }),
    ])
      .then(([consultoriasResposta, consultasResposta]) => {
        setConsultorias(consultoriasResposta);
        setConsultas(consultasResposta);
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function criarConsultoria(dados: {
    titulo: string; descricao: string;
    modalidade: ModalidadeConsultoria; precoCentavos: number;
    inicioEm: string; fimEm: string; status: Consultoria['status'];
    observacoes: string; permitirSobreposicao: boolean;
  }) {
    const consultoria = await requisitarApi<Consultoria>('/consultorias', {
      metodo: 'POST',
      autenticada: true,
      corpo: {
        titulo: dados.titulo,
        descricao: dados.descricao || undefined,
        modalidade: dados.modalidade,
        precoCentavos: dados.precoCentavos,
        inicioEm: dados.inicioEm,
        fimEm: dados.fimEm,
        status: dados.status,
        observacoes: dados.observacoes || undefined,
        permitirSobreposicao: dados.permitirSobreposicao,
      },
    });
    setConsultorias((c) => [consultoria, ...c].sort((a, b) => (a.inicioEm ?? '').localeCompare(b.inicioEm ?? '')));
  }

  if (carregando) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return <PainelConsultorias consultorias={consultorias} consultas={consultas} aoCriar={criarConsultoria} />;
}
