import { useEffect, useState } from 'react';
import { requisitarApi } from '../../servicos/api';
import type { CursoAluno, CursoAlunoDetalhe } from '../../tipos/cursos';
import { formatarReais } from '../../utilitarios/moeda';

export function PaginaAlunoCursos() {
  const [inscricoes, setInscricoes] = useState<CursoAluno[]>([]);
  const [cursoAberto, setCursoAberto] = useState<CursoAlunoDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoCurso, setCarregandoCurso] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisitarApi<CursoAluno[]>('/aluno/cursos', { autenticada: true })
      .then(setInscricoes)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function abrirCurso(cursoId: string) {
    setErro('');
    setCarregandoCurso(true);

    try {
      const detalhe = await requisitarApi<CursoAlunoDetalhe>(`/aluno/cursos/${cursoId}`, {
        autenticada: true,
      });
      setCursoAberto(detalhe);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível abrir o curso.');
    } finally {
      setCarregandoCurso(false);
    }
  }

  if (carregando) {
    return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Meus cursos</h1>
        <p className="mt-1 text-sm text-slate-600">Acesse os cursos liberados pelo profissional.</p>
      </section>

      {erro ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      {inscricoes.length === 0 ? (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">Nenhum curso liberado no momento.</p>
        </article>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <section className="space-y-3">
            {inscricoes.map((inscricao) => (
              <button
                key={inscricao.id}
                className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-primario hover:shadow-md"
                onClick={() => void abrirCurso(inscricao.curso.id)}
                type="button"
              >
                <p className="text-sm font-semibold text-slate-900">{inscricao.curso.titulo}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {inscricao.curso.profissional.nomePublico} · {inscricao.curso._count.modulos} módulos
                </p>
                <p className="mt-2 text-xs font-medium text-primario">
                  {formatarReais(inscricao.curso.precoCentavos)}
                </p>
              </button>
            ))}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            {carregandoCurso ? (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
            ) : cursoAberto ? (
              <div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {cursoAberto.curso.profissional.nomePublico}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{cursoAberto.curso.titulo}</h2>
                  {cursoAberto.curso.descricao ? (
                    <p className="mt-2 text-sm text-slate-600">{cursoAberto.curso.descricao}</p>
                  ) : null}
                </div>

                <div className="mt-5 space-y-4">
                  {cursoAberto.curso.modulos.length === 0 ? (
                    <p className="text-sm text-slate-500">O conteúdo ainda está sendo preparado.</p>
                  ) : (
                    cursoAberto.curso.modulos.map((modulo) => (
                      <div key={modulo.id} className="rounded-md bg-slate-50 p-4">
                        <h3 className="font-semibold text-slate-900">{modulo.titulo}</h3>
                        {modulo.aulas.length === 0 ? (
                          <p className="mt-2 text-sm text-slate-500">Nenhuma aula cadastrada.</p>
                        ) : (
                          <ul className="mt-3 space-y-2">
                            {modulo.aulas.map((aula) => (
                              <li key={aula.id} className="rounded-md bg-white px-3 py-2 text-sm">
                                <p className="font-medium text-slate-800">{aula.titulo}</p>
                                {aula.descricao ? (
                                  <p className="mt-1 text-slate-500">{aula.descricao}</p>
                                ) : null}
                                {aula.videoReferencia ? (
                                  <p className="mt-1 text-xs font-medium text-primario">
                                    Vídeo: {aula.videoReferencia}
                                  </p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Selecione um curso para ver módulos e aulas.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
