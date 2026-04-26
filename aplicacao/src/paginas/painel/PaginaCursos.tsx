import { useEffect, useState } from 'react';
import { PainelConteudoCurso } from '../../componentes/PainelConteudoCurso';
import { PainelCursos } from '../../componentes/PainelCursos';
import { requisitarApi } from '../../servicos/api';
import type { Curso, ModalidadeCurso, StatusCurso } from '../../tipos/cursos';

export function PaginaCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisitarApi<Curso[]>('/cursos', { autenticada: true })
      .then(setCursos)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function criarCurso(dados: {
    titulo: string; slug: string; descricao: string;
    modalidade: ModalidadeCurso; precoCentavos: number; status: StatusCurso;
  }) {
    const curso = await requisitarApi<Curso>('/cursos', {
      metodo: 'POST',
      autenticada: true,
      corpo: {
        titulo: dados.titulo,
        slug: dados.slug,
        descricao: dados.descricao || undefined,
        modalidade: dados.modalidade,
        precoCentavos: dados.precoCentavos,
        status: dados.status,
      },
    });
    setCursos((c) => [curso, ...c]);
  }

  if (carregando) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return (
    <div className="space-y-6">
      <PainelCursos cursos={cursos} aoCriar={criarCurso} />
      <PainelConteudoCurso cursos={cursos} />
    </div>
  );
}
