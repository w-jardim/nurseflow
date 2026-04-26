import { useEffect, useState } from 'react';
import { PainelConsultorias } from '../../componentes/PainelConsultorias';
import { requisitarApi } from '../../servicos/api';
import type { Consultoria, ModalidadeConsultoria } from '../../tipos/consultorias';

export function PaginaConsultorias() {
  const [consultorias, setConsultorias] = useState<Consultoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisitarApi<Consultoria[]>('/consultorias', { autenticada: true })
      .then(setConsultorias)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function criarConsultoria(dados: {
    titulo: string; descricao: string;
    modalidade: ModalidadeConsultoria; precoCentavos: number;
  }) {
    const consultoria = await requisitarApi<Consultoria>('/consultorias', {
      metodo: 'POST',
      autenticada: true,
      corpo: {
        titulo: dados.titulo,
        descricao: dados.descricao || undefined,
        modalidade: dados.modalidade,
        precoCentavos: dados.precoCentavos,
      },
    });
    setConsultorias((c) => [consultoria, ...c]);
  }

  if (carregando) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return <PainelConsultorias consultorias={consultorias} aoCriar={criarConsultoria} />;
}
