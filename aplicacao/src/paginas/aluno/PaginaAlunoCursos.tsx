import { useEffect, useState } from 'react';
import { Badge } from '../../componentes/ui/Badge';
import { EstadoVazio } from '../../componentes/ui/EstadoVazio';
import { requisitarApi } from '../../servicos/api';
import type { AulaCurso, CursoAluno, CursoAlunoDetalhe, ProgressoAula } from '../../tipos/cursos';
import { formatarReais } from '../../utilitarios/moeda';

function aulasDoCurso(curso: CursoAlunoDetalhe | null) {
  return curso?.curso.modulos.flatMap((modulo) => modulo.aulas) ?? [];
}

function aulaConcluida(aula: AulaCurso) {
  return Boolean(aula.progressos?.[0]?.concluida);
}

function calcularProgresso(curso: CursoAlunoDetalhe | null) {
  const aulas = aulasDoCurso(curso);
  const total = aulas.length;
  const concluidas = aulas.filter(aulaConcluida).length;

  return {
    total,
    concluidas,
    percentual: total > 0 ? Math.round((concluidas / total) * 100) : 0,
  };
}

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

  async function alternarProgressoAula(cursoId: string, aulaId: string, concluida: boolean) {
    const progresso = await requisitarApi<ProgressoAula>(
      `/aluno/cursos/${cursoId}/aulas/${aulaId}/progresso`,
      {
        metodo: 'PATCH',
        autenticada: true,
        corpo: {
          concluida,
        },
      },
    );

    setCursoAberto((atual) => {
      if (!atual) return atual;

      return {
        ...atual,
        concluidoEm: progresso.concluidoEm,
        curso: {
          ...atual.curso,
          modulos: atual.curso.modulos.map((modulo) => ({
            ...modulo,
            aulas: modulo.aulas.map((aula) =>
              aula.id === aulaId
                ? {
                    ...aula,
                    progressos: [
                      {
                        concluida: progresso.concluida,
                        atualizadoEm: progresso.atualizadoEm,
                      },
                    ],
                  }
                : aula,
            ),
          })),
        },
      };
    });
    setInscricoes((atuais) =>
      atuais.map((inscricao) =>
        inscricao.curso.id === cursoId
          ? {
              ...inscricao,
              concluidoEm: progresso.concluidoEm,
            }
          : inscricao,
      ),
    );
  }

  const progressoCursoAberto = calcularProgresso(cursoAberto);

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primario">Portal do aluno</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Meus cursos</h1>
            <p className="mt-1 text-sm text-slate-600">Continue seus estudos e acompanhe seu progresso.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-64">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-500">Cursos</p>
              <p className="text-xl font-bold text-slate-900">{inscricoes.length}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 px-3 py-2">
              <p className="text-xs text-emerald-700">Concluídos</p>
              <p className="text-xl font-bold text-emerald-800">
                {inscricoes.filter((inscricao) => inscricao.concluidoEm).length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {erro ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      {carregando ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <div className="h-36 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-72 animate-pulse rounded-xl bg-slate-200" />
        </div>
      ) : inscricoes.length === 0 ? (
        <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <EstadoVazio
            titulo="Nenhum curso liberado"
            descricao="Quando um profissional liberar seu acesso, o curso aparecerá aqui."
          />
        </article>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(300px,380px)_1fr]">
          <section className="space-y-3">
            {inscricoes.map((inscricao) => (
              <button
                key={inscricao.id}
                className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-primario hover:shadow-md ${
                  cursoAberto?.curso.id === inscricao.curso.id
                    ? 'border-primario ring-2 ring-teal-100'
                    : 'border-slate-200'
                }`}
                onClick={() => void abrirCurso(inscricao.curso.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{inscricao.curso.titulo}</p>
                    <p className="mt-1 text-xs text-slate-500">{inscricao.curso.profissional.nomePublico}</p>
                  </div>
                  {inscricao.concluidoEm ? <Badge cor="verde">Concluído</Badge> : <Badge cor="ciano">Ativo</Badge>}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{inscricao.curso._count.modulos} módulos</span>
                  <span className="font-semibold text-primario">{formatarReais(inscricao.curso.precoCentavos)}</span>
                </div>
              </button>
            ))}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {carregandoCurso ? (
              <div className="p-6">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
              </div>
            ) : cursoAberto ? (
              <div>
                <div className="border-b border-slate-100 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {cursoAberto.curso.profissional.nomePublico}
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-slate-950">{cursoAberto.curso.titulo}</h2>
                      {cursoAberto.curso.descricao ? (
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                          {cursoAberto.curso.descricao}
                        </p>
                      ) : null}
                    </div>
                    {cursoAberto.concluidoEm ? <Badge cor="verde">Curso concluído</Badge> : null}
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Progresso</span>
                      <span className="font-semibold text-slate-900">
                        {progressoCursoAberto.concluidas}/{progressoCursoAberto.total} aulas
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primario transition-all"
                        style={{ width: `${progressoCursoAberto.percentual}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {cursoAberto.curso.modulos.length === 0 ? (
                    <EstadoVazio
                      titulo="Conteúdo em preparação"
                      descricao="Os módulos e aulas deste curso ainda não foram publicados."
                    />
                  ) : (
                    cursoAberto.curso.modulos.map((modulo) => (
                      <div key={modulo.id} className="rounded-lg bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-slate-950">{modulo.titulo}</h3>
                          <span className="text-xs text-slate-500">{modulo.aulas.length} aulas</span>
                        </div>
                        {modulo.aulas.length === 0 ? (
                          <p className="mt-2 text-sm text-slate-500">Nenhuma aula cadastrada.</p>
                        ) : (
                          <ul className="mt-3 space-y-2">
                            {modulo.aulas.map((aula) => (
                              <li
                                key={aula.id}
                                className={`rounded-lg border px-3 py-3 text-sm transition ${
                                  aulaConcluida(aula)
                                    ? 'border-emerald-100 bg-emerald-50'
                                    : 'border-slate-100 bg-white'
                                }`}
                              >
                                <label className="flex cursor-pointer items-start gap-3">
                                  <input
                                    checked={Boolean(aula.progressos?.[0]?.concluida)}
                                    className="sr-only"
                                    onChange={(evento) =>
                                      void alternarProgressoAula(
                                        cursoAberto.curso.id,
                                        aula.id,
                                        evento.target.checked,
                                      )
                                    }
                                    type="checkbox"
                                  />
                                  <span
                                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border ${
                                      aulaConcluida(aula)
                                        ? 'border-emerald-600 bg-emerald-600 text-white'
                                        : 'border-slate-300 bg-white text-transparent'
                                    }`}
                                  >
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                      <path
                                        fillRule="evenodd"
                                        d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0L3.296 9.22a1 1 0 011.414-1.414l4.035 4.035 6.543-6.543a1 1 0 011.416-.008z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                  <span className="min-w-0">
                                    <span className="font-medium text-slate-900">{aula.titulo}</span>
                                    {aula.descricao ? (
                                      <span className="mt-1 block break-words text-slate-500">
                                        {aula.descricao}
                                      </span>
                                    ) : null}
                                    {aula.imagemUrl ? (
                                      <img
                                        alt={`Imagem da aula ${aula.titulo}`}
                                        className="mt-3 max-h-80 w-full rounded-lg border border-slate-100 object-cover"
                                        src={aula.imagemUrl}
                                      />
                                    ) : null}
                                    {aula.conteudo ? (
                                      <span className="mt-3 block whitespace-pre-wrap rounded-lg bg-white/70 p-3 text-sm leading-6 text-slate-700">
                                        {aula.conteudo}
                                      </span>
                                    ) : null}
                                    {aula.videoReferencia ? (
                                      <span className="mt-2 block break-all text-xs font-medium text-primario">
                                        Vídeo: {aula.videoReferencia}
                                      </span>
                                    ) : null}
                                    {aula.materialUrl ? (
                                      <a
                                        className="mt-2 inline-flex text-xs font-semibold text-destaque hover:underline"
                                        href={aula.materialUrl}
                                        rel="noreferrer"
                                        target="_blank"
                                      >
                                        Abrir material complementar
                                      </a>
                                    ) : null}
                                  </span>
                                </label>
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
              <EstadoVazio
                titulo="Selecione um curso"
                descricao="Escolha um curso na lista para visualizar módulos, aulas e progresso."
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
