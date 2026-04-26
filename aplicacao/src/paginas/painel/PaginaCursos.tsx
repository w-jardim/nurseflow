import { useEffect, useState } from 'react';
import { PainelConteudoCurso } from '../../componentes/PainelConteudoCurso';
import { PainelCursos } from '../../componentes/PainelCursos';
import { requisitarApi } from '../../servicos/api';
import type { Contato } from '../../tipos/contatos';
import type { Curso, InscricaoCurso, ModalidadeCurso, StatusCurso } from '../../tipos/cursos';

export function PaginaCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [alunos, setAlunos] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    Promise.all([
      requisitarApi<Curso[]>('/cursos', { autenticada: true }),
      requisitarApi<Contato[]>('/alunos', { autenticada: true }),
    ])
      .then(([listaCursos, listaAlunos]) => {
        setCursos(listaCursos);
        setAlunos(listaAlunos);
      })
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

  async function inscreverAluno(dados: { cursoId: string; alunoId: string }) {
    await requisitarApi<InscricaoCurso>(`/cursos/${dados.cursoId}/inscricoes`, {
      metodo: 'POST',
      autenticada: true,
      corpo: {
        alunoId: dados.alunoId,
      },
    });
  }

  if (carregando) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return (
    <div className="space-y-6">
      <PainelCursos cursos={cursos} alunos={alunos} aoCriar={criarCurso} aoInscrever={inscreverAluno} />
      <PainelConteudoCurso cursos={cursos} />
    </div>
  );
}
