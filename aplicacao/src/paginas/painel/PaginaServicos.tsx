import { useEffect, useState } from 'react';
import { PainelServicos } from '../../componentes/PainelServicos';
import { requisitarApi } from '../../servicos/api';
import type { Servico } from '../../tipos/servicos';

type DadosServico = {
  titulo: string;
  descricao: string;
  precoCentavos: number;
  exibirPreco: boolean;
  publicado: boolean;
};

export function PaginaServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisitarApi<Servico[]>('/servicos', { autenticada: true })
      .then(setServicos)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function criarServico(dados: DadosServico) {
    const servico = await requisitarApi<Servico>('/servicos', {
      metodo: 'POST',
      autenticada: true,
      corpo: dados,
    });
    setServicos((atuais) => [servico, ...atuais]);
  }

  async function atualizarServico(id: string, dados: DadosServico) {
    const servico = await requisitarApi<Servico>(`/servicos/${id}`, {
      metodo: 'PUT',
      autenticada: true,
      corpo: dados,
    });
    setServicos((atuais) => atuais.map((atual) => (atual.id === id ? servico : atual)));
  }

  async function excluirServico(id: string) {
    await requisitarApi<{ id: string }>(`/servicos/${id}`, {
      metodo: 'DELETE',
      autenticada: true,
    });
    setServicos((atuais) => atuais.filter((servico) => servico.id !== id));
  }

  if (carregando) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return (
    <PainelServicos
      servicos={servicos}
      aoCriar={criarServico}
      aoAtualizar={atualizarServico}
      aoExcluir={excluirServico}
    />
  );
}
